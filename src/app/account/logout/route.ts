import { NextResponse, type NextRequest } from 'next/server';
import { endpoints } from '@/lib/shopify/customer';
import { FLAG_COOKIE, SESSION_COOKIE, unseal, type CustomerSession } from '@/lib/session';
import { SITE_URL } from '@/lib/site';

// Signs out here and at Shopify. POST only, so a link elsewhere can't sign someone out.
export async function POST(req: NextRequest) {
  const s = await unseal<CustomerSession>(req.cookies.get(SESSION_COOKIE)?.value);
  let target = new URL('/', req.url).toString();
  if (s?.idToken) {
    try {
      const { end_session_endpoint } = await endpoints();
      const u = new URL(end_session_endpoint);
      u.search = new URLSearchParams({ id_token_hint: s.idToken, post_logout_redirect_uri: SITE_URL }).toString();
      target = u.toString();
    } catch { /* fall back to a local sign-out */ }
  }
  const res = NextResponse.redirect(target, 303);
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(FLAG_COOKIE);
  return res;
}
