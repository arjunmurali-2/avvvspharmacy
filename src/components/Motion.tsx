'use client';

import { animate, stagger } from 'animejs';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef } from 'react';

/*
 * The store's motion, all of it subtle and all of it skipped for visitors who ask for reduced motion:
 *  - Lenis: smooth, weighted scrolling (paused while a drawer, sheet or search is open)
 *  - anime.js: elements marked data-anim rise in as they enter the viewport; data-anim="stagger"
 *    brings a list's children in one after another (product grids, the forms index, concerns);
 *    headings marked .split rise word by word.
 * Content is only hidden once <html> has the "anim" class, which a tiny inline script adds before
 * first paint when motion is allowed, so nothing is ever hidden without JavaScript.
 */

export const ANIM_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim')}catch(e){}`;

const LenisCtx = createContext<{ current: Lenis | null }>({ current: null });
export const useLenis = () => useContext(LenisCtx);

const EASE = 'outExpo';

type Anim = ReturnType<typeof animate>;
/**
 * Content must never stay hidden: if the animation hasn't finished well after it should have
 * (a throttled background tab, a stalled frame loop), jump it to its end state.
 */
function settle(a: Anim, ms: number, targets: HTMLElement[] | NodeListOf<HTMLElement>) {
  window.setTimeout(() => {
    try { a.complete(); } catch { /* already done */ }
    targets.forEach((t) => { t.style.opacity = ''; t.style.transform = ''; });
  }, ms + 900);
  return a;
}

function reveal(el: HTMLElement) {
  if (el.hasAttribute('data-in')) return;
  const kind = el.dataset.anim;
  if (kind === 'stagger') {
    el.setAttribute('data-in', '');
    revealChildren(el);
    return;
  }
  if (el.classList.contains('split')) {
    el.setAttribute('data-in', '');
    const words = el.querySelectorAll<HTMLElement>('.split-w > span');
    settle(animate(words, { translateY: ['105%', '0%'], duration: 1100, delay: stagger(55), ease: EASE }), 1100 + words.length * 55, words);
    return;
  }
  const from = kind === 'fade' ? 0 : kind === 'line' ? 0 : 22;
  el.setAttribute('data-in', '');
  if (kind === 'line') {
    settle(animate(el, { scaleX: [0, 1], opacity: [0, 1], duration: 1400, ease: EASE }), 1400, [el]);
    return;
  }
  const delay = Number(el.dataset.delay || 0);
  settle(animate(el, { opacity: [0, 1], translateY: [from, 0], duration: 1000, delay, ease: EASE }), 1000 + delay, [el]);
}

function revealChildren(list: HTMLElement) {
  const kids = [...list.children].filter((c) => !c.hasAttribute('data-in')) as HTMLElement[];
  if (!kids.length) return;
  kids.forEach((k) => k.setAttribute('data-in', ''));
  // long lists (a page of 24 tiles) cap the cascade so the last ones don't lag behind
  const step = Math.min(70, 900 / kids.length);
  settle(animate(kids, { opacity: [0, 1], translateY: [26, 0], duration: 950, delay: stagger(step, { start: 40 }), ease: EASE }), 990 + step * kids.length, kids);
}

export function Motion({ children }: { children: React.ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const path = usePathname();

  // smooth scrolling
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false, anchors: { offset: -90 } });
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
    if (!document.documentElement.classList.contains('anim')) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        reveal(e.target as HTMLElement);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
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
    // safety net: never leave anything hidden for long (e.g. printing, odd scroll containers)
    const t = window.setTimeout(() => document.querySelectorAll<HTMLElement>('[data-anim]:not([data-in])').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) reveal(el);
    }), 2500);
    return () => { io.disconnect(); mo.disconnect(); window.clearTimeout(t); };
  }, [path]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

/** A heading that rises in word by word. Words stay real text for search engines and screen readers. */
export function SplitTitle({ text, as: Tag = 'h1', className = '' }: { text: string; as?: 'h1' | 'h2'; className?: string }) {
  const words = text.split(' ');
  return (
    <Tag className={`split ${className}`} data-anim="split" aria-label={text}>
      {words.map((w, i) => (
        <span key={i}><span className="split-w" aria-hidden="true"><span>{w}</span></span>{i < words.length - 1 ? ' ' : ''}</span>
      ))}
    </Tag>
  );
}

/** Gives a counter (the cart badge) a small pop whenever its value changes. */
export function usePop<T>(value: T) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!ref.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate(ref.current, { scale: [1, 1.45, 1], duration: 650, ease: 'outElastic(1, .6)' });
  }, [value]);
  return ref;
}
