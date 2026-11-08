import { NextResponse } from 'next/server';
import { storefront, HAS_TOKEN } from '@/lib/shopify/client';

// For uptime monitors: is the store up, and can it reach Shopify?
export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    const d = await storefront<{ shop: { name: string } }>('query Health { shop { name } }', {}, { revalidate: false });
    return NextResponse.json({ ok: true, shop: d.shop.name, token: HAS_TOKEN, ms: Date.now() - started });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, ms: Date.now() - started }, { status: 503 });
  }
}
