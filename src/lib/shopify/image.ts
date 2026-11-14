import { IMAGE_TRIM } from '@/content/imageTrim';

/**
 * Product photographs are framed differently in Shopify: some bottles fill the picture, some sit
 * small in the middle. `npm run image-trim` measures where the product is in each one; this asks
 * Shopify's image service for just that region, so every product shows at the same size.
 * A photograph with no measurement (new, or replaced since the last run) is returned unchanged.
 */
export function fitted(url: string): string {
  let file: string;
  try { file = new URL(url).pathname.split('/').pop() ?? ''; } catch { return url; }
  const box = IMAGE_TRIM[file];
  if (!box || url.includes('crop=')) return url;
  const [left, top, width, height] = box;
  return `${url}${url.includes('?') ? '&' : '?'}crop=region&crop_left=${left}&crop_top=${top}&crop_width=${width}&crop_height=${height}`;
}
