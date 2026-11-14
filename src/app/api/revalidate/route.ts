import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// Shopify webhooks (products/collections create, update, delete) refresh the cached catalogue.
// Point them at /api/revalidate. A call is accepted when either:
//  - it carries Shopify's signature (X-Shopify-Hmac-Sha256) made with SHOPIFY_WEBHOOK_SECRET, the
//    signing secret shown under Settings → Notifications → Webhooks; or
//  - its address ends in ?secret=<SHOPIFY_REVALIDATE_SECRET> (for manual refreshes).

function signedByShopify(raw: string, header: string | null): boolean {
  const key = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
  if (!key || !header) return false;
  const expected = createHmac('sha256', key).update(raw, 'utf8').digest();
  const given = Buffer.from(header, 'base64');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.SHOPIFY_REVALIDATE_SECRET;
  const byQuery = !!secret && req.nextUrl.searchParams.get('secret') === secret;
  if (!byQuery && !signedByShopify(raw, req.headers.get('x-shopify-hmac-sha256'))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const topic = req.headers.get('x-shopify-topic') || '';
  let body: { handle?: string } = {};
  try { body = JSON.parse(raw || '{}'); } catch { /* an empty or non-JSON body still refreshes the lists */ }
  if (topic.startsWith('products')) { revalidateTag('products'); if (body.handle) revalidateTag(`product:${body.handle}`); }
  else if (topic.startsWith('collections')) { revalidateTag('collections'); if (body.handle) revalidateTag(`collection:${body.handle}`); }
  else revalidateTag('shopify');
  return NextResponse.json({ ok: true, topic });
}
