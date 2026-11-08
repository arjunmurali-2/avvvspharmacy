import { NextResponse, type NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { mailPharmacy } from '@/lib/mail';

// "Tell me when it's back": stores the request (Neon, if DATABASE_URL is set) and tells the pharmacy.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string; handle?: string; title?: string; hp?: string };
  if (body.hp) return NextResponse.json({ ok: true }); // honeypot
  const email = String(body.email ?? '').trim().toLowerCase();
  const handle = String(body.handle ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (!/^[a-z0-9-]{1,120}$/.test(handle)) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  const title = String(body.title ?? handle).slice(0, 160);

  let stored = false;
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`CREATE TABLE IF NOT EXISTS stock_alerts (id serial PRIMARY KEY, email text NOT NULL, handle text NOT NULL, title text, created_at timestamptz DEFAULT now(), notified_at timestamptz, UNIQUE (email, handle))`;
      await sql`INSERT INTO stock_alerts (email, handle, title) VALUES (${email}, ${handle}, ${title}) ON CONFLICT (email, handle) DO NOTHING`;
      stored = true;
    } catch (e) { console.error('[notify] db', e); }
  }
  const mailed = await mailPharmacy(`Back-in-stock request: ${title}`, `${email} would like to know when ${title} is back in stock.\nhttps://shop.avvvs.com/products/${handle}`).catch(() => false);
  if (!stored && !mailed) return NextResponse.json({ error: 'Alerts are not switched on yet. Please call or WhatsApp us.' }, { status: 503 });
  return NextResponse.json({ ok: true });
}
