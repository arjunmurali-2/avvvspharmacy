import type { MetadataRoute } from 'next';
import { abs } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/account', '/cart', '/wishlist', '/search', '/api/'] }],
    sitemap: abs('/sitemap.xml'),
  };
}
