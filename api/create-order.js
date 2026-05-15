// Vercel Edge function — /api/create-order
// Receives a landing-page order payload and creates a Shopify Draft Order
// via the Admin REST API. Draft orders are manually reviewed before fulfillment.
//
// Env vars required (set in Vercel → Project Settings → Environment Variables):
//   SHOPIFY_CLIENT_ID      Custom app Client ID from partners.shopify.com Dev Dashboard
//   SHOPIFY_CLIENT_SECRET  Custom app Client Secret (mark as Sensitive)
//   SHOPIFY_STORE_DOMAIN   e.g. clartemd.myshopify.com (no scheme, no trailing slash)
//
// Auth model: Shopify killed the legacy shpat_ reveal-once flow on 2026-01-01.
// New custom apps use OAuth client-credentials. We exchange Client ID + Secret
// for a ~24h access token, cache it in module scope across warm invocations,
// and refresh on 401.

export const config = { runtime: 'edge' };

const API_VERSION = '2026-04';

// Module-scope token cache. Persists across warm invocations on the same instance.
let cachedToken = null;
let cachedTokenExpiresAt = 0;
const TOKEN_REFRESH_BUFFER_MS = 60_000; // refresh 1 min before stated expiry

async function getAccessToken(domain, clientId, clientSecret, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && now < cachedTokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken;
  }

  const resp = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const err = new Error(`Shopify OAuth exchange failed (${resp.status}): ${text.slice(0, 400)}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  if (!data.access_token) {
    throw new Error('Shopify OAuth response missing access_token.');
  }

  cachedToken = data.access_token;
  // expires_in is seconds; default to 23h if absent.
  const ttlMs = (typeof data.expires_in === 'number' ? data.expires_in : 82_800) * 1000;
  cachedTokenExpiresAt = now + ttlMs;
  return cachedToken;
}

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

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!clientId || !clientSecret || !domain) {
    return jsonRes({
      error: 'Server not configured (Shopify env vars missing).',
      _diagnostic: {
        SHOPIFY_CLIENT_ID: clientId ? 'set' : 'MISSING',
        SHOPIFY_CLIENT_SECRET: clientSecret ? 'set' : 'MISSING',
        SHOPIFY_STORE_DOMAIN: domain ? `set (${domain})` : 'MISSING',
      },
    }, 500, headers);
  }

  const url = `https://${domain}/admin/api/${API_VERSION}/draft_orders.json`;
  const draftPayload = JSON.stringify(buildDraftOrder(body));

  async function postDraft(token) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: draftPayload,
    });
  }

  let resp;
  try {
    let token = await getAccessToken(domain, clientId, clientSecret);
    resp = await postDraft(token);

    // If the cached token was revoked or rotated, force a fresh exchange and retry once.
    if (resp.status === 401) {
      token = await getAccessToken(domain, clientId, clientSecret, true);
      resp = await postDraft(token);
    }
  } catch (err) {
    return jsonRes({
      error: 'Order system temporarily unavailable. Please try again or WhatsApp us to place the order.',
      _diagnostic: `Shopify auth/network error: ${String(err)}`,
    }, 502, headers);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    if (resp.status === 401) {
      return jsonRes({
        error: 'Order system temporarily unavailable. Please try again or WhatsApp us to place the order.',
        _diagnostic: 'Shopify auth failed even after token refresh — check Client ID/Secret and that the custom app is installed on this store.',
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
