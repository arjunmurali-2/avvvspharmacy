// Small encrypted cookies (AES-GCM, Web Crypto) for the sign-in session and the OAuth handshake.
// Works in Node and in middleware alike.

const enc = new TextEncoder();
const dec = new TextDecoder();
let keyPromise: Promise<CryptoKey> | null = null;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to 32 or more characters');
  return s;
}

function key() {
  if (!keyPromise) {
    keyPromise = crypto.subtle.digest('SHA-256', enc.encode(secret())).then((raw) =>
      crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']));
  }
  return keyPromise;
}

const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export async function seal(data: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), enc.encode(JSON.stringify(data)));
  return `${b64u(iv)}.${b64u(ct)}`;
}

export async function unseal<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const [iv, ct] = token.split('.');
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64u(iv) }, await key(), fromB64u(ct));
    return JSON.parse(dec.decode(pt)) as T;
  } catch { return null; }
}

export function randomString(bytes = 32) { return b64u(crypto.getRandomValues(new Uint8Array(bytes))); }
export async function sha256b64u(s: string) { return b64u(await crypto.subtle.digest('SHA-256', enc.encode(s))); }

export const SESSION_COOKIE = 'avvvs_customer';
export const OAUTH_COOKIE = 'avvvs_oauth';
export const CART_COOKIE = 'avvvs_cart';
/** Not secret: only tells the browser a session exists. */
export const FLAG_COOKIE = 'avvvs_signed_in';

export type CustomerSession = { access: string; refresh?: string; idToken?: string; expiresAt: number };
