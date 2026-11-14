'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef } from 'react';

/*
 * The store's motion. All of it is quiet, and none of it runs for visitors who ask for reduced motion.
 *  - Lenis: smooth, weighted scrolling (paused while a drawer, sheet or search is open).
 *  - One reveal: elements marked data-anim settle in (a fade with a short rise) as they enter the
 *    viewport; data-anim="stagger" brings a list's children in one after another.
 * The movement itself is a CSS transition (globals.css), so it runs on the compositor and cannot
 * stall with the page's scripts. This file only marks elements as seen (data-in).
 * Content is hidden only under the "js" class, which a tiny inline script adds before first paint
 * when motion is allowed, so nothing is ever hidden without JavaScript.
 */

export const ANIM_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js')}catch(e){}`;

const LenisCtx = createContext<{ current: Lenis | null }>({ current: null });
export const useLenis = () => useContext(LenisCtx);

/** Longest cascade: a page of 24 tiles must not leave the last ones waiting. */
const MAX_STEPS = 8;

function revealChildren(list: HTMLElement) {
  const kids = [...list.children].filter((c) => !c.hasAttribute('data-in')) as HTMLElement[];
  kids.forEach((k, i) => {
    k.style.setProperty('--i', String(Math.min(i, MAX_STEPS)));
    k.setAttribute('data-in', '');
  });
}

function reveal(el: HTMLElement) {
  if (el.hasAttribute('data-in')) return;
  el.setAttribute('data-in', '');
  if (el.dataset.anim === 'stagger') revealChildren(el);
}

export function Motion({ children }: { children: React.ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const path = usePathname();

  // smooth scrolling
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false, anchors: { offset: -90 } });
    lenis.current = l;
    let raf = requestAnimationFrame(function loop(t) { l.raf(t); raf = requestAnimationFrame(loop); });
    // menus, the cart drawer and search lock the page by setting overflow on <html>; Lenis follows
    const root = document.documentElement;
    const mo = new MutationObserver(() => { if (root.style.overflow === 'hidden') l.stop(); else l.start(); });
    mo.observe(root, { attributes: true, attributeFilter: ['style'] });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); l.destroy(); lenis.current = null; };
  }, []);

  // a new page starts at the top, without a smooth glide from the old position
  useEffect(() => { lenis.current?.scrollTo(0, { immediate: true, force: true }); }, [path]);

  // reveals: watch every data-anim element, including ones added later ("Show more", cart lines)
  useEffect(() => {
    if (!document.documentElement.classList.contains('js')) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        reveal(e.target as HTMLElement);
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>('[data-anim]:not([data-in])').forEach((el) => io.observe(el));
    scan(document);
    // grids that are already in view and gain children (load more) bring the new ones in at once
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        const t = m.target as HTMLElement;
        if (t.dataset?.anim === 'stagger' && t.hasAttribute('data-in')) revealChildren(t);
        m.addedNodes.forEach((n) => { if (n instanceof HTMLElement) { if (n.matches('[data-anim]')) io.observe(n); scan(n); } });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // safety net: never leave anything in view hidden (printing, odd scroll containers, a jump scroll)
    const sweep = () => document.querySelectorAll<HTMLElement>('[data-anim]:not([data-in])').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) reveal(el);
    });
    const t = window.setInterval(sweep, 1200);
    return () => { io.disconnect(); mo.disconnect(); window.clearInterval(t); };
  }, [path]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

/** Gives a counter (the cart badge) a small pulse whenever its value changes. */
export function usePop<T>(value: T) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!ref.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ref.current.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  }, [value]);
  return ref;
}
