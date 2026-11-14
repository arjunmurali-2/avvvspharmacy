/*
 * Measures the empty space around every product photograph, so the store can show all products
 * at the same size. Shopify's photos are framed differently (some bottles fill the picture, some
 * sit small in the middle); this finds the box that actually holds the product in each one and
 * writes it to src/content/imageTrim.ts. The store then asks Shopify's image service for just that
 * region (see src/lib/shopify/image.ts).
 *
 *   npm run image-trim
 *
 * Run it again whenever product photos are added or replaced. A photo with no entry (or a replaced
 * photo, whose file name changes) is simply shown uncropped, as before. Nothing in Shopify changes.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'avvvsglobal.myshopify.com';
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';

const SIZE = 256;        // analyse a small copy
const TOLERANCE = 18;    // how far a pixel must be from the background colour to count as product
const MIN_SHARE = 0.012; // a row or column needs this share of product pixels (ignores specks)
const PAD = 0.035;       // breathing room kept around the product

type Img = { url: string; width: number | null; height: number | null };

async function allImages(): Promise<Img[]> {
  const out: Img[] = [];
  let after: string | null = null;
  for (;;) {
    const res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($after: String) { products(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { images(first: 10) { nodes { url width height } } } } }`,
        variables: { after },
      }),
    });
    const json = await res.json() as { data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: { images: { nodes: Img[] } }[] } } };
    for (const p of json.data.products.nodes) out.push(...p.images.nodes);
    if (!json.data.products.pageInfo.hasNextPage) break;
    after = json.data.products.pageInfo.endCursor;
  }
  return out;
}

export const fileOf = (url: string) => new URL(url).pathname.split('/').pop()!;

async function measure(img: Img): Promise<[number, number, number, number] | null> {
  if (!img.width || !img.height) return null;
  const res = await fetch(`${img.url}${img.url.includes('?') ? '&' : '?'}width=${SIZE}`);
  if (!res.ok) return null;
  const { data, info } = await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const at = (x: number, y: number) => { const i = (y * w + x) * c; return [data[i], data[i + 1], data[i + 2]]; };
  // the background is whatever the four corners agree on
  const corners = [at(1, 1), at(w - 2, 1), at(1, h - 2), at(w - 2, h - 2)];
  const bg = [0, 1, 2].map((k) => corners.map((p) => p[k]).sort((a, b) => a - b)[1]);
  const cols = new Array<number>(w).fill(0), rows = new Array<number>(h).fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = at(x, y);
    if (Math.max(Math.abs(p[0] - bg[0]), Math.abs(p[1] - bg[1]), Math.abs(p[2] - bg[2])) > TOLERANCE) { cols[x]++; rows[y]++; }
  }
  const first = (a: number[], n: number) => a.findIndex((v) => v / n >= MIN_SHARE);
  const last = (a: number[], n: number) => a.length - 1 - [...a].reverse().findIndex((v) => v / n >= MIN_SHARE);
  const x0 = first(cols, h), x1 = last(cols, h), y0 = first(rows, w), y1 = last(rows, w);
  if (x0 < 0 || y0 < 0 || x1 <= x0 || y1 <= y0) return null;
  // pad, clamp, and scale back to the original photograph's pixels
  const px = (x1 - x0 + 1) * PAD, py = (y1 - y0 + 1) * PAD;
  const L = Math.max(0, x0 - px) / w, T = Math.max(0, y0 - py) / h;
  const R = Math.min(w, x1 + 1 + px) / w, B = Math.min(h, y1 + 1 + py) / h;
  // a photo that already fills its frame needs no crop
  if (R - L > 0.94 && B - T > 0.94) return null;
  return [Math.round(L * img.width), Math.round(T * img.height), Math.round((R - L) * img.width), Math.round((B - T) * img.height)];
}

const images = await allImages();
console.log(`${images.length} product photographs`);
const out: Record<string, [number, number, number, number]> = {};
let done = 0;
const queue = [...images];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let img = queue.pop(); img; img = queue.pop()) {
    try { const box = await measure(img); if (box) out[fileOf(img.url)] = box; } catch (e) { console.warn('skipped', fileOf(img.url), (e as Error).message); }
    if (++done % 50 === 0) console.log(`  ${done}/${images.length}`);
  }
}));

const body = Object.keys(out).sort().map((k) => `  ${JSON.stringify(k)}: [${out[k].join(', ')}],`).join('\n');
writeFileSync('src/content/imageTrim.ts', `// Generated by \`npm run image-trim\`. Do not edit by hand.
// For each product photograph (by file name): the region that holds the product, in the
// photograph's own pixels, as [left, top, width, height].
export const IMAGE_TRIM: Record<string, [number, number, number, number]> = {
${body}
};
`);
console.log(`${Object.keys(out).length} photographs get a crop; ${images.length - Object.keys(out).length} already fill their frame or could not be measured.`);
