import { NextResponse, type NextRequest } from 'next/server';
import { exchangeCode } from '@/lib/shopify/customer';
import { FLAG_COOKIE, OAUTH_COOKIE, SESSION_COOKIE, seal, unseal } from '@/lib/session';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const saved = await unseal<{ state: string; verifier: string; back: string }>(req.cookies.get(OAUTH_COOKIE)?.value);
  const fail = (why: string) => NextResponse.redirect(new URL(`/account?error=${encodeURIComponent(why)}`, req.url));
  if (p.get('error')) return fail('Sign-in was cancelled.');
  if (!saved || !p.get('code') || p.get('state') !== saved.state) return fail('Sign-in expired. Please try again.');
  try {
    const session = await exchangeCode(p.get('code')!, saved.verifier);
    const res = NextResponse.redirect(new URL(saved.back || '/account', req.url));
    res.cookies.set(SESSION_COOKIE, await seal(session), { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    res.cookies.set(FLAG_COOKIE, '1', { sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/account' });
    return res;
  } catch (e) {
    console.error('[account] code exchange failed', e);
    return fail('Sign-in could not be completed. Please try again.');
  }
}
