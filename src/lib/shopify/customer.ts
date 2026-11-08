import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, unseal, type CustomerSession } from '../session';
import { SITE_URL } from '../site';

/*
 * Shopify Customer Account API: sign-in with Shopify's one-time email code (OAuth 2 + PKCE, public
 * client), then the customer's own GraphQL API. Endpoints come from the store's discovery documents.
 */

export const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() || '';
const ACCOUNT_DOMAIN = process.env.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN || 'avvvsglobal.com';
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';
export const ACCOUNTS_ENABLED = !!CLIENT_ID && !!process.env.SESSION_SECRET;
export const REDIRECT_URI = `${SITE_URL}/account/callback`;
const UA = 'AVVVS Ayur Store (shop.avvvs.com)';

type Discovery = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint: string; graphql_api: string };
let discovery: Promise<Discovery> | null = null;

export function endpoints(): Promise<Discovery> {
  if (!discovery) {
    discovery = (async () => {
      const [oidc, api] = await Promise.all([
        fetch(`https://${ACCOUNT_DOMAIN}/.well-known/openid-configuration`, { next: { revalidate: 86400 } }).then((r) => r.json()),
        fetch(`https://${ACCOUNT_DOMAIN}/.well-known/customer-account-api`, { next: { revalidate: 86400 } }).then((r) => r.json()),
      ]);
      // pin the API version this store was built against
      const graphql = String(api.graphql_api).replace(/\/api\/[^/]+\/graphql$/, `/api/${VERSION}/graphql`);
      return { authorization_endpoint: oidc.authorization_endpoint, token_endpoint: oidc.token_endpoint, end_session_endpoint: oidc.end_session_endpoint, graphql_api: graphql };
    })().catch((e) => { discovery = null; throw e; });
  }
  return discovery;
}

type TokenResponse = { access_token: string; refresh_token?: string; id_token?: string; expires_in: number };

async function tokenRequest(body: Record<string, string>): Promise<CustomerSession> {
  const { token_endpoint } = await endpoints();
  const res = await fetch(token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: SITE_URL, 'User-Agent': UA },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...body }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Token request failed (${res.status}): ${await res.text().catch(() => '')}`);
  const t = (await res.json()) as TokenResponse;
  return { access: t.access_token, refresh: t.refresh_token, idToken: t.id_token, expiresAt: Date.now() + t.expires_in * 1000 };
}

export const exchangeCode = (code: string, verifier: string) =>
  tokenRequest({ grant_type: 'authorization_code', redirect_uri: REDIRECT_URI, code, code_verifier: verifier });

export async function refreshSession(s: CustomerSession): Promise<CustomerSession> {
  if (!s.refresh) throw new Error('No refresh token');
  const next = await tokenRequest({ grant_type: 'refresh_token', refresh_token: s.refresh });
  return { ...next, idToken: next.idToken ?? s.idToken, refresh: next.refresh ?? s.refresh };
}

/** The signed-in customer's session, or null. Refreshing happens in middleware, where cookies can be written. */
export async function getSession(): Promise<CustomerSession | null> {
  if (!ACCOUNTS_ENABLED) return null;
  const jar = await cookies();
  const s = await unseal<CustomerSession>(jar.get(SESSION_COOKIE)?.value);
  if (!s || s.expiresAt < Date.now()) return null;
  return s;
}

export class CustomerAuthError extends Error {}

export async function customerQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const s = await getSession();
  if (!s) throw new CustomerAuthError('Not signed in');
  const { graphql_api } = await endpoints();
  const res = await fetch(graphql_api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: s.access, Origin: SITE_URL, 'User-Agent': UA },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (res.status === 401) throw new CustomerAuthError('Session expired');
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '));
  return body.data as T;
}

/* ---------------- queries ---------------- */

export type Address = {
  id: string; firstName: string | null; lastName: string | null; company: string | null;
  address1: string | null; address2: string | null; city: string | null; zip: string | null;
  zoneCode: string | null; territoryCode: string | null; phoneNumber: string | null; formatted: string[];
};
const ADDRESS = `id firstName lastName company address1 address2 city zip zoneCode territoryCode phoneNumber formatted`;
const MONEY = `amount currencyCode`;

export type Customer = {
  id: string; firstName: string | null; lastName: string | null; displayName: string;
  emailAddress: { emailAddress: string } | null; phoneNumber: { phoneNumber: string } | null;
  defaultAddress: { id: string } | null;
  addresses: { nodes: Address[] };
};

export async function getCustomer() {
  const d = await customerQuery<{ customer: Customer }>(`query { customer {
    id firstName lastName displayName
    emailAddress { emailAddress } phoneNumber { phoneNumber }
    defaultAddress { id }
    addresses(first: 20) { nodes { ${ADDRESS} } }
  } }`);
  return d.customer;
}

export type OrderSummary = {
  id: string; name: string; number: number; processedAt: string; cancelledAt: string | null;
  financialStatus: string | null; fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { nodes: { title: string; quantity: number; image: { url: string; altText: string | null } | null }[] };
};

export async function getOrders(after?: string | null) {
  const d = await customerQuery<{ customer: { orders: { nodes: OrderSummary[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } }>(
    `query Orders($after: String) { customer { orders(first: 20, after: $after, sortKey: PROCESSED_AT, reverse: true) {
      nodes { id name number processedAt cancelledAt financialStatus fulfillmentStatus totalPrice { ${MONEY} }
        lineItems(first: 4) { nodes { title quantity image { url altText } } } }
      pageInfo { hasNextPage endCursor }
    } } }`, { after: after ?? null });
  return d.customer.orders;
}

export type OrderDetail = Omit<OrderSummary, 'lineItems'> & {
  statusPageUrl: string;
  subtotal: { amount: string; currencyCode: string } | null;
  totalShipping: { amount: string; currencyCode: string };
  totalTax: { amount: string; currencyCode: string } | null;
  shippingAddress: Address | null;
  lineItems: { nodes: { id: string; title: string; variantTitle: string | null; quantity: number; variantId: string | null; productId: string | null;
    image: { url: string; altText: string | null } | null; price: { amount: string; currencyCode: string } | null; totalPrice: { amount: string; currencyCode: string } | null }[] };
  fulfillments: { nodes: { id: string; status: string | null; latestShipmentStatus: string | null; updatedAt: string; trackingInformation: { company: string | null; number: string | null; url: string | null }[] }[] };
};

export async function getOrder(id: string) {
  const d = await customerQuery<{ order: OrderDetail | null }>(`query Order($id: ID!) { order(id: $id) {
    id name number processedAt cancelledAt financialStatus fulfillmentStatus statusPageUrl
    totalPrice { ${MONEY} } subtotal { ${MONEY} } totalShipping { ${MONEY} } totalTax { ${MONEY} }
    shippingAddress { ${ADDRESS} }
    lineItems(first: 100) { nodes { id title variantTitle quantity variantId productId image { url altText } price { ${MONEY} } totalPrice { ${MONEY} } } }
    fulfillments(first: 20) { nodes { id status latestShipmentStatus updatedAt trackingInformation { company number url } } }
  } }`, { id });
  return d.order;
}

/* ---------------- mutations ---------------- */

type UserErrors = { userErrors: { field: string[] | null; message: string }[] };
function check(p: UserErrors) {
  if (p.userErrors?.length) throw new Error(p.userErrors.map((e) => e.message).join(' '));
}

export type AddressInput = Partial<Omit<Address, 'id' | 'formatted'>>;

export async function updateProfile(input: { firstName: string; lastName: string }) {
  const d = await customerQuery<{ customerUpdate: UserErrors }>(
    `mutation U($input: CustomerUpdateInput!) { customerUpdate(input: $input) { userErrors { field message } } }`, { input });
  check(d.customerUpdate);
}

export async function createAddress(address: AddressInput, defaultAddress: boolean) {
  const d = await customerQuery<{ customerAddressCreate: UserErrors }>(
    `mutation C($address: CustomerAddressInput!, $default: Boolean) { customerAddressCreate(address: $address, defaultAddress: $default) { userErrors { field message } } }`,
    { address, default: defaultAddress });
  check(d.customerAddressCreate);
}

export async function updateAddress(addressId: string, address: AddressInput, defaultAddress: boolean) {
  const d = await customerQuery<{ customerAddressUpdate: UserErrors }>(
    `mutation U($id: ID!, $address: CustomerAddressInput, $default: Boolean) { customerAddressUpdate(addressId: $id, address: $address, defaultAddress: $default) { userErrors { field message } } }`,
    { id: addressId, address, default: defaultAddress });
  check(d.customerAddressUpdate);
}

export async function deleteAddress(addressId: string) {
  const d = await customerQuery<{ customerAddressDelete: UserErrors }>(
    `mutation D($id: ID!) { customerAddressDelete(addressId: $id) { userErrors { field message } } }`, { id: addressId });
  check(d.customerAddressDelete);
}

/** The wishlist follows a signed-in customer through a customer metafield (custom.wishlist, JSON). */
export async function getWishlist(): Promise<string[]> {
  const d = await customerQuery<{ customer: { metafield: { value: string } | null } }>(
    `query { customer { metafield(namespace: "custom", key: "wishlist") { value } } }`);
  try { const v = JSON.parse(d.customer.metafield?.value ?? '[]'); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
}

export async function saveWishlist(customerId: string, handles: string[]) {
  const d = await customerQuery<{ metafieldsSet: UserErrors }>(
    `mutation S($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message } } }`,
    { m: [{ ownerId: customerId, namespace: 'custom', key: 'wishlist', type: 'json', value: JSON.stringify(handles.slice(0, 200)) }] });
  check(d.metafieldsSet);
}
