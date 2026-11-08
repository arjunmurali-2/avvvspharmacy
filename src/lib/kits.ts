import 'server-only';
import { getCollectionPage, getCollections } from './shopify/catalog';
import type { Collection, ProductCard } from './shopify/types';

/*
 * Care kits: groups of medicines put together by AVVVS's pharmacist, made as ordinary Shopify
 * collections whose handle starts with `kit-`. A kit for a concern starts with that concern's
 * slug, e.g. `kit-pain-management-knee-care`, and then also appears on the concern's page.
 * (Shopify collections can't carry tags, so the handle does the job.)
 */
export const KIT_PREFIX = 'kit-';
export type Kit = Collection & { products: ProductCard[] };

export async function getKits(concernSlug?: string): Promise<Kit[]> {
  const all = await getCollections().catch(() => []);
  const kits = all.filter((c) => c.handle.startsWith(KIT_PREFIX) && c.count > 0)
    .filter((c) => !concernSlug || c.handle.startsWith(`${KIT_PREFIX}${concernSlug}`));
  const withProducts = await Promise.all(kits.map(async (k) => {
    const r = await getCollectionPage(k.handle, { first: 12 }).catch(() => null);
    return r ? { ...r.collection, products: r.page.products } : null;
  }));
  return withProducts.filter((k): k is Kit => !!k && k.products.length > 0);
}
