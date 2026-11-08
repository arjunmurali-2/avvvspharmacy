import type { Money } from './shopify/types';

const formatters = new Map<string, Intl.NumberFormat>();
export function money(m: Money | null | undefined, opts: { compact?: boolean } = {}) {
  if (!m) return '';
  const key = `${m.currencyCode}-${opts.compact ? 1 : 0}`;
  let f = formatters.get(key);
  if (!f) {
    const n = Number(m.amount);
    f = new Intl.NumberFormat('en-IN', { style: 'currency', currency: m.currencyCode, minimumFractionDigits: opts.compact && Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
    formatters.set(key, f);
  }
  return f.format(Number(m.amount));
}
export const amount = (m: Money | null | undefined) => (m ? Number(m.amount) : 0);

/** Shopify titles are in capitals ("AMRITARISHTAM"); show them as names. Short codes stay as they are. */
export function titleCase(s: string) {
  return s.toLowerCase().replace(/(^|[\s\-(/&])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase())
    .replace(/\b(Ii|Iii|Iv)\b/g, (m) => m.toUpperCase());
}

/** The first letter a medicine files under in the A–Z index. */
export const indexLetter = (title: string) => {
  const c = title.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
};

export const gidNumber = (gid: string) => gid.split('/').pop()?.split('?')[0] ?? gid;

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

export function dateIN(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
