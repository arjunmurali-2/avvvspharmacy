import 'server-only';
import { CONCERN_MAP, CONCERNS_BY_HANDLE } from '@/content/concernMap';
import { getAllProducts, type Listing } from './shopify/catalog';
import type { ProductCard, ProductPage } from './shopify/types';
import { CONCERN_PREFIX } from './site';

/*
 * Which medicines belong to which concern.
 *
 * Shopify tags come first: a product tagged `concern-pain-management` is listed under Pain
 * management. For any concern that no product is tagged with yet, the store falls back to the
 * starting map in content/concernMap.ts. Once AVVVS tags products in Shopify (by hand, or with
 * `npm run tag-concerns`), the tags take over automatically, one concern at a time.
 */

const tagSlugs = (p: Pick<ProductCard, 'tags'>) =>
  (p.tags ?? []).filter((t) => t.toLowerCase().startsWith(CONCERN_PREFIX)).map((t) => t.toLowerCase().slice(CONCERN_PREFIX.length));

/** The concerns that Shopify tags cover, across the whole catalogue. */
function taggedConcerns(all: ProductCard[]) {
  const s = new Set<string>();
  for (const p of all) for (const slug of tagSlugs(p)) s.add(slug);
  return s;
}

/** Concern slugs for one product. */
export async function concernsFor(product: Pick<ProductCard, 'handle' | 'tags'>): Promise<string[]> {
  const all = await getAllProducts().catch(() => [] as ProductCard[]);
  const tagged = taggedConcerns(all);
  const fromTags = tagSlugs(product);
  const fromMap = (CONCERNS_BY_HANDLE[product.handle] ?? []).filter((slug) => !tagged.has(slug));
  return [...new Set([...fromTags, ...fromMap])];
}

/** Every product in a concern, from tags if the concern is tagged in Shopify, else from the map. */
export async function concernProducts(slug: string): Promise<{ products: ProductCard[]; source: 'tags' | 'map' }> {
  const all = await getAllProducts();
  if (taggedConcerns(all).has(slug)) return { products: all.filter((p) => tagSlugs(p).includes(slug)), source: 'tags' };
  const handles = new Set(CONCERN_MAP[slug] ?? []);
  return { products: all.filter((p) => handles.has(p.handle)), source: 'map' };
}

/** How many products each concern has (for the concerns index). */
export async function concernCounts(): Promise<Record<string, number>> {
  const all = await getAllProducts();
  const tagged = taggedConcerns(all);
  const counts: Record<string, number> = {};
  for (const slug of new Set([...Object.keys(CONCERN_MAP), ...tagged])) {
    counts[slug] = tagged.has(slug)
      ? all.filter((p) => tagSlugs(p).includes(slug)).length
      : all.filter((p) => (CONCERN_MAP[slug] ?? []).includes(p.handle)).length;
  }
  return counts;
}

/** Applies the store's filters and sort to an in-memory list (concern lists are small). */
export function applyListing(products: ProductCard[], l: Listing): ProductPage {
  const price = (p: ProductCard) => Number(p.priceRange.minVariantPrice.amount);
  let list = products
    .filter((p) => !l.inStock || p.availableForSale)
    .filter((p) => !l.type || p.productType.toUpperCase() === l.type.toUpperCase())
    .filter((p) => !l.min || price(p) >= l.min)
    .filter((p) => !l.max || price(p) <= l.max);
  switch (l.sort) {
    case 'price-asc': list = [...list].sort((a, b) => price(a) - price(b)); break;
    case 'price-desc': list = [...list].sort((a, b) => price(b) - price(a)); break;
    case 'name': list = [...list].sort((a, b) => a.title.localeCompare(b.title)); break;
    default:
      // featured: in-stock first, then by name
      list = [...list].sort((a, b) => Number(b.availableForSale) - Number(a.availableForSale) || a.title.localeCompare(b.title));
  }
  const max = products.length ? Math.ceil(Math.max(...products.map(price))) : 0;
  const inStock = products.filter((p) => p.availableForSale).length;
  return {
    products: list,
    total: list.length,
    pageInfo: { hasNextPage: false, endCursor: null },
    filters: [
      { id: 'filter.v.availability', label: 'Availability', type: 'LIST', values: [{ id: 'a1', label: 'In stock', count: inStock, input: '{"available":true}' }] },
      { id: 'filter.v.price', label: 'Price', type: 'PRICE_RANGE', values: [{ id: 'p', label: 'Price', count: 0, input: JSON.stringify({ price: { min: 0, max } }) }] },
    ],
  };
}
