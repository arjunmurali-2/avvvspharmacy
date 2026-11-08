'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import * as A from '@/app/actions';
import type { Cart } from '@/lib/shopify/types';
import { trackAddToCart, trackRemoveFromCart, trackWishlist, type Item } from '@/lib/track';

/*
 * The visitor's side of the store: the cart (held by Shopify, mirrored here), the cart drawer,
 * short notices, the wishlist and recently viewed medicines. The wishlist and recently viewed
 * live in localStorage; a signed-in customer's wishlist is also kept on their Shopify account.
 */

type Toast = { id: number; text: string; tone?: 'error'; action?: { label: string; run: () => void } };
type Ctx = {
  cart: Cart | null;
  signedIn: boolean;
  ready: boolean;
  busy: boolean;
  drawer: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (merchandiseId: string, quantity: number, item?: Item, opts?: { silent?: boolean }) => Promise<boolean>;
  update: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  setCart: (c: Cart | null) => void;
  run: (p: Promise<A.CartResult>) => Promise<A.CartResult>;
  toast: (t: Omit<Toast, 'id'>) => void;
  wishlist: string[];
  toggleWish: (handle: string, item?: Item) => void;
  recent: string[];
  noteViewed: (handle: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore outside StoreProvider');
  return c;
};

const WISH_KEY = 'avvvs-wishlist';
const RECENT_KEY = 'avvvs-recent';
const read = (k: string): string[] => { try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; } };
const write = (k: string, v: string[]) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // a readable companion to the httpOnly session cookie, so static pages know who is signed in
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { setSignedIn(/(?:^|; )avvvs_signed_in=1/.test(document.cookie)); }, []);
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [busy, startBusy] = useTransition();
  const tid = useRef(0);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++tid.current;
    setToasts((all) => [...all.slice(-1), { ...t, id }]);
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), t.tone === 'error' ? 7000 : 4500);
  }, []);

  // the cart is fetched in the browser so every page can stay statically cached
  useEffect(() => {
    A.getCart().then((c) => { setCart(c); setReady(true); }).catch(() => setReady(true));
    setWishlist(read(WISH_KEY));
    setRecent(read(RECENT_KEY));
  }, []);

  // signed in: merge the account's wishlist with this browser's, then keep them in step
  const synced = useRef(false);
  useEffect(() => {
    if (!signedIn || synced.current) return;
    synced.current = true;
    A.accountWishlist().then((remote) => {
      if (!remote) return;
      const merged = [...new Set([...read(WISH_KEY), ...remote])];
      setWishlist(merged);
      write(WISH_KEY, merged);
      if (merged.length !== remote.length) A.syncWishlist(merged);
    });
  }, [signedIn]);

  const run = useCallback(async (p: Promise<A.CartResult>) => {
    const r = await p;
    if (r.cart !== undefined) setCart(r.cart);
    if (r.error) toast({ text: r.error, tone: 'error' });
    return r;
  }, [toast]);

  const add = useCallback(async (merchandiseId: string, quantity: number, item?: Item, opts?: { silent?: boolean }) => {
    let ok = false;
    await new Promise<void>((resolve) => startBusy(async () => {
      const r = await run(A.addToCart([{ merchandiseId, quantity }]));
      ok = !r.error;
      if (ok && item) trackAddToCart([{ ...item, quantity }]);
      if (ok && !opts?.silent) setDrawer(true);
      resolve();
    }));
    return ok;
  }, [run]);

  const update = useCallback(async (lineId: string, quantity: number) => {
    const before = cart?.lines.nodes.find((l) => l.id === lineId);
    // optimistic: show the new quantity at once; Shopify's answer replaces it
    if (cart && before) setCart({ ...cart, lines: { ...cart.lines, nodes: cart.lines.nodes.map((l) => (l.id === lineId ? { ...l, quantity } : l)) } });
    await run(A.updateLine(lineId, quantity));
    if (before && quantity < before.quantity) trackRemoveFromCart([{ id: before.merchandise.id, name: before.merchandise.product.title, price: Number(before.cost.amountPerQuantity.amount), quantity: before.quantity - quantity }]);
  }, [cart, run]);

  const remove = useCallback(async (lineId: string) => {
    const line = cart?.lines.nodes.find((l) => l.id === lineId);
    if (cart && line) setCart({ ...cart, lines: { ...cart.lines, nodes: cart.lines.nodes.filter((l) => l.id !== lineId) } });
    const r = await run(A.removeLine(lineId));
    if (line && !r.error) {
      trackRemoveFromCart([{ id: line.merchandise.id, name: line.merchandise.product.title, price: Number(line.cost.amountPerQuantity.amount), quantity: line.quantity }]);
      toast({ text: `Removed ${line.merchandise.product.title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}.`, action: { label: 'Undo', run: () => { add(line.merchandise.id, line.quantity, undefined, { silent: true }); } } });
    }
  }, [cart, run, toast, add]);

  const toggleWish = useCallback((handle: string, item?: Item) => {
    setWishlist((list) => {
      const has = list.includes(handle);
      const next = has ? list.filter((h) => h !== handle) : [handle, ...list].slice(0, 200);
      write(WISH_KEY, next);
      if (signedIn) A.syncWishlist(next);
      if (!has && item) trackWishlist(item);
      return next;
    });
  }, [signedIn]);

  const noteViewed = useCallback((handle: string) => {
    setRecent((list) => {
      const next = [handle, ...list.filter((h) => h !== handle)].slice(0, 16);
      write(RECENT_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => ({
    cart, signedIn, ready, busy, drawer,
    openDrawer: () => setDrawer(true), closeDrawer: () => setDrawer(false),
    add, update, remove, setCart, run, toast, wishlist, toggleWish, recent, noteViewed,
  }), [cart, signedIn, ready, busy, drawer, add, update, remove, run, toast, wishlist, toggleWish, recent, noteViewed]);

  return (
    <StoreCtx.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.tone === 'error' ? ' is-error' : ''}`} role={t.tone === 'error' ? 'alert' : 'status'}>
            <span>{t.text}</span>
            {t.action && <button type="button" onClick={() => { t.action!.run(); setToasts((all) => all.filter((x) => x.id !== t.id)); }}>{t.action.label}</button>}
          </div>
        ))}
      </div>
    </StoreCtx.Provider>
  );
}
