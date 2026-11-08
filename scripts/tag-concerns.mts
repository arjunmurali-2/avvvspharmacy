/*
 * Copies the starting concern categories (src/content/concernMap.ts) into Shopify as product tags,
 * e.g. `concern-pain-management`. After this, Shopify is the source of truth: edit tags in the
 * Shopify admin and the store follows.
 *
 *   npm run tag-concerns            dry run: lists what would be tagged, changes nothing
 *   npm run tag-concerns -- --apply adds the tags in Shopify
 *
 * It only ever ADDS concern tags; it never removes or edits other tags.
 *
 * Needs, in .env.local:
 *   SHOPIFY_STORE_DOMAIN   e.g. avvvsglobal.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN    an Admin API access token from a custom app with the
 *                          read_products and write_products scopes (Settings → Apps → Develop apps)
 */
import { readFileSync, existsSync } from 'node:fs';
import { CONCERN_MAP } from '../src/content/concernMap.ts';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'avvvsglobal.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';
const APPLY = process.argv.includes('--apply');

const byHandle = new Map<string, string[]>();
for (const [slug, handles] of Object.entries(CONCERN_MAP)) {
  for (const h of handles) byHandle.set(h, [...(byHandle.get(h) ?? []), `concern-${slug}`]);
}

console.log(`${byHandle.size} products, ${Object.keys(CONCERN_MAP).length} concerns.${APPLY ? '' : ' Dry run: nothing will change.'}\n`);

if (!APPLY) {
  for (const [h, tags] of [...byHandle].sort()) console.log(`${h.padEnd(36)} ${tags.join(', ')}`);
  console.log('\nRun with --apply to add these tags in Shopify.');
  process.exit(0);
}

if (!TOKEN) {
  console.error('SHOPIFY_ADMIN_TOKEN is not set. See the comment at the top of this script.');
  process.exit(1);
}

async function admin<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/admin/api/${VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN! },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json() as { data?: T; errors?: unknown };
  if (!res.ok || body.errors) throw new Error(JSON.stringify(body.errors ?? res.status));
  return body.data as T;
}

let done = 0;
const missing: string[] = [];
for (const [handle, tags] of byHandle) {
  const d = await admin<{ products: { nodes: { id: string; tags: string[] }[] } }>(
    'query P($q: String!) { products(first: 1, query: $q) { nodes { id tags } } }', { q: `handle:${handle}` });
  const p = d.products.nodes[0];
  if (!p) { missing.push(handle); continue; }
  const add = tags.filter((t) => !p.tags.includes(t));
  if (!add.length) { console.log(`= ${handle}`); continue; }
  const r = await admin<{ tagsAdd: { userErrors: { message: string }[] } }>(
    'mutation T($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }', { id: p.id, tags: add });
  if (r.tagsAdd.userErrors.length) console.error(`! ${handle}: ${r.tagsAdd.userErrors.map((e) => e.message).join('; ')}`);
  else { done++; console.log(`+ ${handle}: ${add.join(', ')}`); }
}
console.log(`\nTagged ${done} products.${missing.length ? ` Not found in Shopify: ${missing.join(', ')}` : ''}`);
