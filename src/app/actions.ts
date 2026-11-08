'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CART_COOKIE } from '@/lib/session';
import * as C from '@/lib/shopify/cart';
import type { Cart, PredictiveResult, ProductCard, ProductPage } from '@/lib/shopify/types';
import { getAllProducts, getCollectionPage, getProducts, getProductsByHandles, predictiveSearch, searchProducts, type Listing } from '@/lib/shopify/catalog';
import { matchSymptoms } from '@/lib/symptoms';
import { getSession } from '@/lib/shopify/customer';
import * as Account from '@/lib/shopify/customer';
import { logError } from '@/lib/log';

/* ---------------- cart ---------------- */

export type CartResult = { cart: Cart | null; error?: string };

const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 };

async function cartId() { return (await cookies()).get(CART_COOKIE)?.value; }
async function remember(cart: Cart) { (await cookies()).set(CART_COOKIE, cart.id, COOKIE_OPTS); return cart; }

async function run(fn: () => Promise<Cart>, action = 'cart'): Promise<CartResult> {
  try { return { cart: await fn() }; } catch (e) {
    if (!(e instanceof C.CartError)) await logError(action, e, { cartId: await cartId() });
    const id = await cartId();
    const cart = id ? await C.fetchCart(id).catch(() => null) : null;
    return { cart, error: e instanceof C.CartError ? e.message : 'Something went wrong. Please try again.' };
  }
}

/** A signed-in customer's details travel with the cart into checkout. */
async function buyer() {
  const s = await getSession();
  return s ? { customerAccessToken: s.access } : undefined;
}

export async function getCart(): Promise<Cart | null> {
  const id = await cartId();
  if (!id) return null;
  const cart = await C.fetchCart(id).catch(() => null);
  if (!cart) { (await cookies()).delete(CART_COOKIE); return null; }
  // a cart that has been through checkout stops existing; a fresh one starts next time
  return cart;
}

export async function addToCart(lines: C.LineInput[]): Promise<CartResult> {
  return run(async () => {
    const id = await cartId();
    const existing = id ? await C.fetchCart(id).catch(() => null) : null;
    if (existing) return C.addLines(existing.id, lines);
    return remember(await C.createCart(lines, await buyer()));
  }, 'addToCart');
}

export async function updateLine(lineId: string, quantity: number): Promise<CartResult> {
  return run(async () => {
    const id = (await cartId())!;
    return quantity <= 0 ? C.removeLines(id, [lineId]) : C.updateLines(id, [{ id: lineId, quantity: Math.min(quantity, 99) }]);
  }, 'updateLine');
}

export async function removeLine(lineId: string): Promise<CartResult> {
  return run(async () => C.removeLines((await cartId())!, [lineId]), 'removeLine');
}

export async function applyDiscount(code: string): Promise<CartResult> {
  return run(async () => {
    const id = (await cartId())!;
    const cart = await C.fetchCart(id);
    const codes = [...new Set([...(cart?.discountCodes.map((d) => d.code) ?? []), code.trim()])].filter(Boolean);
    const next = await C.setDiscountCodes(id, codes);
    const added = next.discountCodes.find((d) => d.code.toLowerCase() === code.trim().toLowerCase());
    if (added && !added.applicable) {
      // keep the cart clean: an unusable code is removed again and reported
      await C.setDiscountCodes(id, codes.filter((c) => c.toLowerCase() !== code.trim().toLowerCase()));
      throw new C.CartError(`The code “${code.trim()}” isn’t valid for this order.`);
    }
    return next;
  }, 'applyDiscount');
}

export async function removeDiscount(code: string): Promise<CartResult> {
  return run(async () => {
    const id = (await cartId())!;
    const cart = await C.fetchCart(id);
    return C.setDiscountCodes(id, (cart?.discountCodes.map((d) => d.code) ?? []).filter((c) => c !== code));
  }, 'removeDiscount');
}

export async function saveNote(note: string): Promise<CartResult> {
  return run(async () => C.setNote((await cartId())!, note.slice(0, 1000)), 'saveNote');
}

/** Records the uploaded prescription on the cart; it shows on the Shopify order as note attributes. */
export async function attachPrescription(file: { url: string; name: string } | null): Promise<CartResult> {
  return run(async () => {
    const id = (await cartId())!;
    const cart = await C.fetchCart(id);
    const keep = (cart?.attributes ?? []).filter((a) => !a.key.startsWith('Prescription')).map((a) => ({ key: a.key, value: a.value ?? '' }));
    const attrs = file ? [...keep, { key: 'Prescription', value: file.url }, { key: 'Prescription file', value: file.name.slice(0, 120) }] : keep;
    return C.setAttributes(id, attrs);
  }, 'attachPrescription');
}

/** Tracking details the browser hands over at checkout; the Shopify pixel reads them back. */
export type CheckoutTracking = { gaClientId?: string; consent?: string };

function trackingAttributes(t?: CheckoutTracking) {
  if (!t) return [];
  const clean = (v?: string) => (v ?? '').replace(/[^\w.,-]/g, '').slice(0, 80);
  return [
    { key: '_ga_client_id', value: clean(t.gaClientId) },
    { key: '_consent', value: clean(t.consent) || 'none' },
  ].filter((a) => a.value);
}

/** Buy now: a one-off cart for this item alone, straight to Shopify checkout. The main cart is untouched. */
export async function buyNow(merchandiseId: string, quantity: number, tracking?: CheckoutTracking): Promise<{ url?: string; error?: string }> {
  try {
    let cart = await C.createCart([{ merchandiseId, quantity }], await buyer());
    const attrs = trackingAttributes(tracking);
    if (attrs.length) cart = await C.setAttributes(cart.id, attrs);
    return { url: cart.checkoutUrl };
  } catch (e) {
    if (!(e instanceof C.CartError)) await logError('buyNow', e, { merchandiseId });
    return { error: e instanceof C.CartError ? e.message : 'Checkout could not be started. Please try again.' };
  }
}

/** Before checkout, attach the signed-in customer so Shopify pre-fills their details. */
export async function prepareCheckout(tracking?: CheckoutTracking): Promise<{ url?: string; error?: string }> {
  const id = await cartId();
  if (!id) return { error: 'Your cart is empty.' };
  try {
    const b = await buyer();
    let cart = b ? await C.setBuyer(id, { ...b, countryCode: 'IN' }) : await C.fetchCart(id);
    if (!cart?.totalQuantity) return { error: 'Your cart is empty.' };
    // keep the note and prescription attributes, refresh the tracking ones
    const attrs = trackingAttributes(tracking);
    if (attrs.length) {
      const keep = cart.attributes.filter((a) => !a.key.startsWith('_ga_client_id') && a.key !== '_consent').map((a) => ({ key: a.key, value: a.value ?? '' }));
      cart = await C.setAttributes(id, [...keep, ...attrs]);
    }
    return { url: cart.checkoutUrl };
  } catch (e) {
    await logError('prepareCheckout', e, { cartId: id });
    const cart = await C.fetchCart(id).catch(() => null);
    return cart ? { url: cart.checkoutUrl } : { error: (e as Error).message };
  }
}

/* ---------------- browsing ---------------- */

export async function loadMore(source: { kind: 'collection'; handle: string } | { kind: 'products'; query?: string } | { kind: 'search'; term: string }, l: Listing): Promise<ProductPage> {
  if (source.kind === 'collection') {
    const r = await getCollectionPage(source.handle, l);
    return r?.page ?? { products: [], pageInfo: { hasNextPage: false, endCursor: null }, filters: [] };
  }
  if (source.kind === 'search') return searchProducts(source.term, l);
  return getProducts(l, source.query);
}

export async function predictive(term: string): Promise<PredictiveResult> {
  const t = term.trim().slice(0, 80);
  const empty: PredictiveResult = { products: [], collections: [], queries: [] };
  if (t.length < 2) return empty;
  const [shop, sym] = await Promise.all([predictiveSearch(t).catch(() => empty), Promise.resolve(matchSymptoms(t))]);
  if (!sym.concerns.length && !sym.hits.length) return shop;
  // medicines whose own uses match the symptom, after Shopify's name matches
  const all = await getAllProducts().catch(() => []);
  const byHandle = new Map(all.map((p) => [p.handle, p]));
  const seen = new Set(shop.products.map((p) => p.handle));
  const extra = sym.hits.filter((h) => !seen.has(h.handle) && byHandle.has(h.handle))
    .sort((a, b) => Number(byHandle.get(b.handle)!.availableForSale) - Number(byHandle.get(a.handle)!.availableForSale))
    .map((h) => ({ ...byHandle.get(h.handle)!, why: h.why }));
  // Shopify's own matches also say which traditional use matched, when one did
  const why = new Map(sym.hits.map((h) => [h.handle, h.why]));
  const named = shop.products.map((p) => (why.has(p.handle) ? { ...p, why: why.get(p.handle) } : p));
  // keep room for symptom matches: at most 5 of Shopify's, then the rest
  const merged = [...named.slice(0, extra.length ? 5 : 8), ...extra, ...named.slice(5)];
  const seenOut = new Set<string>();
  return {
    ...shop,
    products: merged.filter((p) => !seenOut.has(p.handle) && seenOut.add(p.handle)).slice(0, 8),
    concerns: sym.concerns.map((c) => ({ slug: c.slug, name: c.name, note: c.note })),
  };
}

export async function cardsFor(handles: string[]): Promise<ProductCard[]> {
  return getProductsByHandles(handles).catch(() => []);
}

/* ---------------- account ---------------- */

export async function accountWishlist(): Promise<string[] | null> {
  if (!(await getSession())) return null;
  return Account.getWishlist().catch(() => null);
}

export async function syncWishlist(handles: string[]): Promise<boolean> {
  if (!(await getSession())) return false;
  try {
    const c = await Account.getCustomer();
    await Account.saveWishlist(c.id, handles);
    return true;
  } catch { return false; }
}

export type FormState = { ok?: boolean; error?: string };

export async function saveProfile(_: FormState, fd: FormData): Promise<FormState> {
  try {
    await Account.updateProfile({ firstName: String(fd.get('firstName') ?? '').trim(), lastName: String(fd.get('lastName') ?? '').trim() });
    revalidatePath('/account');
    return { ok: true };
  } catch (e) { return { error: (e as Error).message }; }
}

function addressFrom(fd: FormData): Account.AddressInput {
  const g = (k: string) => String(fd.get(k) ?? '').trim() || null;
  return {
    firstName: g('firstName'), lastName: g('lastName'), company: g('company'),
    address1: g('address1'), address2: g('address2'), city: g('city'), zip: g('zip'),
    zoneCode: g('zoneCode'), territoryCode: g('territoryCode') || 'IN', phoneNumber: g('phoneNumber'),
  };
}

export async function saveAddress(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const id = String(fd.get('id') ?? '');
    const def = fd.get('default') === 'on';
    if (id) await Account.updateAddress(id, addressFrom(fd), def);
    else await Account.createAddress(addressFrom(fd), def);
    revalidatePath('/account/addresses');
    return { ok: true };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function removeAddress(id: string): Promise<FormState> {
  try { await Account.deleteAddress(id); revalidatePath('/account/addresses'); return { ok: true }; } catch (e) { return { error: (e as Error).message }; }
}

/** Buy again: every still-available line of a past order goes back into the cart. */
export async function reorder(orderId: string): Promise<CartResult & { skipped?: number }> {
  try {
    const order = await Account.getOrder(orderId);
    if (!order) return { cart: null, error: 'Order not found.' };
    const lines = order.lineItems.nodes.filter((l) => l.variantId).map((l) => ({ merchandiseId: l.variantId!, quantity: l.quantity }));
    if (!lines.length) return { cart: null, error: 'None of these items can be ordered again online.' };
    // add one at a time so a discontinued item doesn't block the rest
    let last: CartResult = { cart: null };
    let skipped = 0;
    for (const line of lines) {
      const r = await addToCart([line]);
      if (r.error) skipped++; else last = r;
    }
    return { ...last, skipped };
  } catch (e) { return { cart: null, error: (e as Error).message }; }
}
