// Vercel Edge function — /api/create-order
// Receives a landing-page order payload and creates a Shopify Draft Order
// via the Admin REST API. Draft orders are manually reviewed before fulfillment.
//
// Env vars required (set in Vercel → Project Settings → Environment Variables):
//   SHOPIFY_ADMIN_TOKEN   atkn_... from Dev Dashboard "App automation token"
//   SHOPIFY_STORE_DOMAIN  e.g. clartemd.myshopify.com (no scheme, no trailing slash)
//
// NOTE on token expiry: Dev Dashboard automation tokens expire (~6 months).
// Current token expires 2026-11-12. Rotate before then or orders will start
// returning 401 from this endpoint.

export const config = { runtime: 'edge' };

const API_VERSION = '2026-04';

const ALLOWED_ORIGINS = [
  'https://clartemd.com.pk',
  'https://www.clartemd.com.pk',
  'http://localhost:8765',
  'http://127.0.0.1:8765',
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonRes(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function splitName(full) {
  const t = (full || '').trim();
  if (!t) return { first: '', last: '' };
  const parts = t.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function buildDraftOrder(payload) {
  const {
    contact = {}, shipping = {}, items = [], totals = {},
    payment, concern, page, bundle_in_cart, used_ai_preview, ts,
  } = payload;

  const { first, last } = splitName(contact.name);

  const line_items = items.map(i => ({
    title: i.name,
    sku: i.sku,
    price: String(i.price),
    quantity: i.qty || 1,
    taxable: false,
    requires_shipping: true,
  }));

  const address = {
    first_name: first,
    last_name: last,
    address1: shipping.address || '',
    city: shipping.city || '',
    zip: shipping.postal || '',
    phone: contact.phone || '',
    country: 'Pakistan',
    country_code: 'PK',
  };

  const draft_order = {
    line_items,
    shipping_address: address,
    billing_address: address,
    note: shipping.notes ? `Customer note: ${shipping.notes}` : undefined,
    note_attributes: [
      { name: 'lp_page', value: page || '' },
      { name: 'lp_concern', value: concern || '' },
      { name: 'lp_payment_pref', value: payment || '' },
      { name: 'lp_used_ai_preview', value: String(!!used_ai_preview) },
      { name: 'lp_bundle_in_cart', value: String(!!bundle_in_cart) },
      { name: 'lp_submitted_at', value: ts || new Date().toISOString() },
    ],
    tags: [
      'landing-page',
      `lp:${page || 'unknown'}`,
      `concern:${concern || 'unknown'}`,
      payment ? `pay:${payment}` : null,
    ].filter(Boolean).join(', '),
    taxes_included: true,
    use_customer_default_address: false,
  };

  // Attach customer only if we have a contact point Shopify will accept.
  if (contact.email || contact.phone) {
    draft_order.customer = {
      first_name: first,
      last_name: last,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
    };
  }

  // Mirror the LP's shipping line so Shopify totals match what the buyer saw.
  if (typeof totals.shipping === 'number' && totals.shipping > 0) {
    draft_order.shipping_line = {
      title: 'Standard shipping',
      price: String(totals.shipping),
    };
  }

  return { draft_order };
}

function validatePayload(body) {
  if (!body || typeof body !== 'object') return 'Invalid body.';
  if (!Array.isArray(body.items) || body.items.length === 0) return 'No items in order.';
  for (const i of body.items) {
    if (!i || typeof i !== 'object') return 'Malformed line item.';
    if (typeof i.name !== 'string' || !i.name) return 'Line item missing name.';
    if (typeof i.price !== 'number' || i.price < 0) return 'Line item has invalid price.';
  }
  const c = body.contact || {};
  if (!c.email && !c.phone) return 'Contact email or phone is required.';
  const s = body.shipping || {};
  if (!s.address || !s.city) return 'Shipping address and city are required.';
  return null;
}

export default async function handler(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return jsonRes({ error: 'Method not allowed' }, 405, headers);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ error: 'Invalid JSON body.' }, 400, headers);
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return jsonRes({ error: validationError }, 400, headers);
  }

  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!token || !domain) {
    return jsonRes({ error: 'Server not configured (Shopify env vars missing).' }, 500, headers);
  }

  const url = `https://${domain}/admin/api/${API_VERSION}/draft_orders.json`;

  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify(buildDraftOrder(body)),
    });
  } catch (err) {
    return jsonRes({ error: 'Upstream network error.', detail: String(err) }, 502, headers);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    // 401 most likely means the automation token expired or was revoked.
    // Surface a clear signal so it doesn't get diagnosed as "the form is broken."
    if (resp.status === 401) {
      return jsonRes({
        error: 'Order system temporarily unavailable. Please try again or WhatsApp us to place the order.',
        _diagnostic: 'Shopify auth failed — automation token likely expired or revoked. Rotate via Dev Dashboard → App → Settings.',
        detail: text.slice(0, 600),
      }, 502, headers);
    }
    return jsonRes({
      error: `Order creation failed (${resp.status}).`,
      detail: text.slice(0, 600),
    }, 502, headers);
  }

  const data = await resp.json();
  const draft = data?.draft_order;
  return jsonRes({
    ok: true,
    draft_order_id: draft?.id,
    draft_order_name: draft?.name,
  }, 200, headers);
}
