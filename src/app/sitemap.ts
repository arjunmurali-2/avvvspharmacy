import type { MetadataRoute } from 'next';
import { getAllProducts, getCollections, getPages } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import { CONCERNS, CONCERN_PREFIX, FORMS, abs } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, pages] = await Promise.all([safe(getAllProducts(), []), safe(getCollections(), []), safe(getPages(), [])]);
  const now = new Date();
  return [
    { url: abs('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: abs('/medicines'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: abs('/concerns'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...FORMS.map((f) => ({ url: abs(`/shop/${f.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...CONCERNS.map((c) => ({ url: abs(`/concerns/${c.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...collections.filter((c) => !c.handle.startsWith(CONCERN_PREFIX)).map((c) => ({ url: abs(`/collections/${c.handle}`), lastModified: new Date(c.updatedAt), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...products.map((p) => ({ url: abs(`/products/${p.handle}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7, images: p.featuredImage ? [p.featuredImage.url] : undefined })),
    ...pages.map((p) => ({ url: abs(`/pages/${p.handle}`), lastModified: new Date(p.updatedAt), changeFrequency: 'monthly' as const, priority: 0.3 })),
  ];
}
