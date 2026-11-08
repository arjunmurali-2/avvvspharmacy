'use server';

import { getProduct, getRecommendations } from '@/lib/shopify/catalog';
import type { ProductCard } from '@/lib/shopify/types';

/** Shopify's complementary picks for the first item in the cart, falling back to related ones. */
export async function getRecsFor(handle: string): Promise<ProductCard[]> {
  try {
    const p = await getProduct(handle);
    if (!p) return [];
    const comp = await getRecommendations(p.id, 'COMPLEMENTARY');
    return comp.length ? comp : await getRecommendations(p.id, 'RELATED');
  } catch { return []; }
}
