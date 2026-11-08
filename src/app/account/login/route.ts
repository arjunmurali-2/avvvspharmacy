import { NextResponse, type NextRequest } from 'next/server';
import { ACCOUNTS_ENABLED, CLIENT_ID, REDIRECT_URI, endpoints } from '@/lib/shopify/customer';
import { OAUTH_COOKIE, randomString, seal, sha256b64u } from '@/lib/session';

// Starts Shopify sign-in (one-time code by email). PKCE: the verifier stays in an encrypted cookie.
export async function GET(req: NextRequest) {
  if (!ACCOUNTS_ENABLED) return NextResponse.redirect(new URL('/account', req.url));
  const back = req.nextUrl.searchParams.get('next');
  const state = randomString(16);
  const nonce = randomString(16);
  const verifier = randomString(48);
  const { authorization_endpoint } = await endpoints();
  const url = new URL(authorization_endpoint);
  url.search = new URLSearchParams({
    client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT_URI,
    scope: 'openid email customer-account-api:full', state, nonce,
    code_challenge: await sha256b64u(verifier), code_challenge_method: 'S256', locale: 'en',
  }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_COOKIE, await seal({ state, nonce, verifier, back: back?.startsWith('/') ? back : '/account' }),
    { httpOnly: true, sameSite: 'lax', secure: true, path: '/account', maxAge: 600 });
  return res;
}
