import { NextResponse, type NextRequest } from 'next/server';
import { FLAG_COOKIE, SESSION_COOKIE, seal, unseal, type CustomerSession } from './lib/session';

/*
 * Keeps a signed-in customer signed in: when the access token is within five minutes of expiring,
 * it is refreshed here (the one place both the request and the response cookies can be touched).
 */
export async function middleware(req: NextRequest) {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw || !process.env.SESSION_SECRET || !process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) return NextResponse.next();
  const s = await unseal<CustomerSession>(raw);
  if (!s) { const r = NextResponse.next(); r.cookies.delete(SESSION_COOKIE); r.cookies.delete(FLAG_COOKIE); return r; }
  if (s.expiresAt - Date.now() > 5 * 60_000) return NextResponse.next();
  if (!s.refresh) { const r = NextResponse.next(); r.cookies.delete(SESSION_COOKIE); r.cookies.delete(FLAG_COOKIE); return r; }

  try {
    const domain = process.env.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN || 'checkout.avvvs.com';
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.avvvs.com').replace(/\/$/, '');
    const oidc = await fetch(`https://${domain}/.well-known/openid-configuration`).then((r) => r.json());
    const res = await fetch(oidc.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: site, 'User-Agent': 'AVVVS Ayur Store' },
      body: new URLSearchParams({ grant_type: 'refresh_token', client_id: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!, refresh_token: s.refresh }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const t = await res.json() as { access_token: string; refresh_token?: string; id_token?: string; expires_in: number };
    const next: CustomerSession = { access: t.access_token, refresh: t.refresh_token ?? s.refresh, idToken: t.id_token ?? s.idToken, expiresAt: Date.now() + t.expires_in * 1000 };
    const sealed = await seal(next);
    // the page being rendered right now must see the new token too
    req.cookies.set(SESSION_COOKIE, sealed);
    const r = NextResponse.next({ request: { headers: req.headers } });
    r.cookies.set(SESSION_COOKIE, sealed, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    return r;
  } catch {
    const r = NextResponse.next();
    r.cookies.delete(SESSION_COOKIE); r.cookies.delete(FLAG_COOKIE);
    return r;
  }
}

export const config = { matcher: ['/((?!_next/|brand/|favicon|api/revalidate).*)'] };
