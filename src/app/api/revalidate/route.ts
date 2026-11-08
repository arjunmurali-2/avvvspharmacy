import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

// Shopify webhooks (products/collections create, update, delete) refresh the cached catalogue.
// Point them at /api/revalidate?secret=<SHOPIFY_REVALIDATE_SECRET>.
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_REVALIDATE_SECRET;
  if (!secret || req.nextUrl.searchParams.get('secret') !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  const topic = req.headers.get('x-shopify-topic') || '';
  const body = await req.json().catch(() => ({})) as { handle?: string };
  if (topic.startsWith('products')) { revalidateTag('products'); if (body.handle) revalidateTag(`product:${body.handle}`); }
  else if (topic.startsWith('collections')) { revalidateTag('collections'); if (body.handle) revalidateTag(`collection:${body.handle}`); }
  else revalidateTag('shopify');
  return NextResponse.json({ ok: true, topic });
}
