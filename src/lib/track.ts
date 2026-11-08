'use client';

// GA4 ecommerce events and Meta Pixel standard events. Both are no-ops until Analytics.tsx has
// loaded the tags, which only happens after the visitor's consent.

type Fn = (...args: unknown[]) => void;
const w = () => (typeof window === 'undefined' ? undefined : (window as unknown as { gtag?: Fn; fbq?: Fn; __avvvsGa?: boolean; __avvvsPixel?: boolean }));

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

export type Item = { id: string; name: string; price: number; quantity?: number; category?: string };
const gaItems = (items: Item[]) => items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity ?? 1, item_category: i.category, item_brand: 'AVVVS' }));
const total = (items: Item[]) => items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);

function ga(event: string, params: Record<string, unknown>) { const x = w(); if (x?.__avvvsGa && x.gtag) x.gtag('event', event, params); }
function px(event: string, params: Record<string, unknown>) { const x = w(); if (x?.__avvvsPixel && x.fbq) x.fbq('track', event, params); }

export function trackPageView(path: string) {
  ga('page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  px('PageView', {});
}
export function trackViewItem(i: Item) {
  ga('view_item', { currency: 'INR', value: i.price, items: gaItems([i]) });
  px('ViewContent', { content_ids: [i.id], content_name: i.name, content_type: 'product', value: i.price, currency: 'INR' });
}
export function trackViewList(name: string, items: Item[]) {
  ga('view_item_list', { item_list_name: name, items: gaItems(items.slice(0, 20)) });
}
export function trackAddToCart(items: Item[]) {
  ga('add_to_cart', { currency: 'INR', value: total(items), items: gaItems(items) });
  px('AddToCart', { content_ids: items.map((i) => i.id), content_type: 'product', value: total(items), currency: 'INR' });
}
export function trackRemoveFromCart(items: Item[]) { ga('remove_from_cart', { currency: 'INR', value: total(items), items: gaItems(items) }); }
export function trackViewCart(items: Item[]) { ga('view_cart', { currency: 'INR', value: total(items), items: gaItems(items) }); }
export function trackBeginCheckout(items: Item[]) {
  ga('begin_checkout', { currency: 'INR', value: total(items), items: gaItems(items) });
  px('InitiateCheckout', { content_ids: items.map((i) => i.id), num_items: items.reduce((s, i) => s + (i.quantity ?? 1), 0), value: total(items), currency: 'INR' });
}
export function trackSearch(term: string) { ga('search', { search_term: term }); px('Search', { search_string: term }); }
export function trackWishlist(i: Item) { ga('add_to_wishlist', { currency: 'INR', value: i.price, items: gaItems([i]) }); px('AddToWishlist', { content_ids: [i.id], value: i.price, currency: 'INR' }); }

/**
 * What checkout needs to join a purchase to this visit: the GA4 client id (from the _ga cookie,
 * "GA1.1.123.456" → "123.456") and the visitor's cookie choice. Read only, never set here.
 */
export function checkoutTracking(): { gaClientId?: string; consent: string } {
  let consent = 'none';
  try {
    const c = JSON.parse(localStorage.getItem('avvvs-consent') || 'null') as { analytics?: boolean; marketing?: boolean } | null;
    if (c) consent = [c.analytics && 'analytics', c.marketing && 'marketing'].filter(Boolean).join(',') || 'none';
  } catch { /* storage blocked */ }
  const ga = document.cookie.match(/(?:^|; )_ga=GA\d\.\d\.(\d+\.\d+)/)?.[1];
  return { gaClientId: consent.includes('analytics') ? ga : undefined, consent };
}
