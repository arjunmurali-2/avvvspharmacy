import { NextResponse, type NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

// Receives an optional prescription for the cart. Checks type and size, stores it in Vercel Blob
// under a random, unguessable name, and returns the link that is saved on the cart.
export const runtime = 'nodejs';

const TYPES: Record<string, string> = {
  'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif',
};
const MAX = 10 * 1024 * 1024;

// a light per-instance limit so the endpoint can't be used as free file hosting
const hits = new Map<string, { n: number; at: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > 60 * 60_000) { hits.set(ip, { n: 1, at: now }); return false; }
  h.n++;
  return h.n > 20;
}

function sniff(b: Uint8Array): string | null {
  const s = (i: number, ...x: number[]) => x.every((v, k) => b[i + k] === v);
  if (s(0, 0x25, 0x50, 0x44, 0x46)) return 'application/pdf';
  if (s(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (s(0, 0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (s(0, 0x52, 0x49, 0x46, 0x46) && s(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  if (s(4, 0x66, 0x74, 0x79, 0x70)) return 'image/heic'; // ISO media (HEIC/HEIF)
  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limited(ip)) return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Prescription upload is not switched on yet. Please email it to mail@avvvs.com with your order number.' }, { status: 503 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'That file is larger than 10 MB.' }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type || !TYPES[type]) return NextResponse.json({ error: 'Please upload a PDF or a photo (JPG, PNG or HEIC).' }, { status: 415 });

  const name = `prescriptions/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${TYPES[type]}`;
  try {
    const blob = await put(name, Buffer.from(bytes), { access: 'public', contentType: type, addRandomSuffix: true });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('[prescription] upload failed', e);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
