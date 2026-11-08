'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { predictive } from '@/app/actions';
import type { PredictiveResult } from '@/lib/shopify/types';
import { money, titleCase } from '@/lib/format';
import { CONCERNS, FORMS, formByType } from '@/lib/site';
import { trackSearch } from '@/lib/track';
import { CloseIcon, SearchIcon } from './Icons';

const RECENT = 'avvvs-searches';
const readRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT) || '[]'); } catch { return []; } };
const saveRecent = (t: string) => { try { localStorage.setItem(RECENT, JSON.stringify([t, ...readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6))); } catch { /* ignore */ } };

type Opt = { key: string; href: string; label: string; kind: 'query' | 'product' | 'link' };

/** Instant search: medicines, collections and suggestions as you type, all from Shopify. Full keyboard support. */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState('');
  const [res, setRes] = useState<PredictiveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    if (!open) return;
    setRecent(readRecent());
    const t = window.setTimeout(() => input.current?.focus(), 30);
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); document.documentElement.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // debounce, and ignore answers that arrive after a newer question
  useEffect(() => {
    const t = term.trim();
    setActive(-1);
    if (t.length < 2) { setRes(null); setLoading(false); return; }
    setLoading(true);
    const n = ++seq.current;
    const timer = window.setTimeout(() => {
      predictive(t).then((r) => { if (n === seq.current) { setRes(r); setLoading(false); } });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [term]);

  const options: Opt[] = useMemo(() => {
    if (!res) return [];
    return [
      ...res.queries.slice(0, 4).map((q) => ({ key: `q-${q.text}`, href: `/search?q=${encodeURIComponent(q.text)}`, label: q.text, kind: 'query' as const })),
      ...res.products.map((p) => ({ key: p.id, href: `/products/${p.handle}`, label: p.title, kind: 'product' as const })),
      ...res.collections.map((c) => ({ key: `c-${c.handle}`, href: c.handle.startsWith('concern-') ? `/concerns/${c.handle.slice(8)}` : `/collections/${c.handle}`, label: c.title, kind: 'link' as const })),
    ];
  }, [res]);

  const go = (href: string, t?: string) => {
    if (t) { saveRecent(t); trackSearch(t); }
    onClose();
    setTerm('');
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && options[active]) return go(options[active].href, term.trim());
    const t = term.trim();
    if (t) go(`/search?q=${encodeURIComponent(t)}`, t);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!options.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % options.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? options.length - 1 : a - 1)); }
  };

  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, id]);

  if (!open) return null;
  const idx = (key: string) => options.findIndex((o) => o.key === key);
  const optProps = (key: string) => {
    const i = idx(key);
    return { id: `${id}-opt-${i}`, role: 'option', 'aria-selected': i === active, onMouseEnter: () => setActive(i) } as const;
  };
  const t = term.trim();
  const nothing = res && !loading && !options.length;

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Search the store">
      <button type="button" className="scrim" aria-label="Close search" onClick={onClose} />
      <div className="search-panel">
        <form className="search-input" role="search" onSubmit={submit}>
          <SearchIcon />
          <input ref={input} type="search" value={term} onChange={(e) => setTerm(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Search by medicine name, form or concern" aria-label="Search medicines"
            role="combobox" aria-expanded={options.length > 0} aria-controls={`${id}-list`} aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined} autoComplete="off" spellCheck={false} enterKeyHint="search" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search"><CloseIcon /></button>
        </form>

        <div className="search-body" data-lenis-prevent id={`${id}-list`} role="listbox" aria-label="Suggestions">
          {t.length < 2 && (
            <>
              {recent.length > 0 && (
                <div className="search-group">
                  <h3>Recent searches</h3>
                  <div className="search-quick">{recent.map((r) => <Link key={r} href={`/search?q=${encodeURIComponent(r)}`} onClick={onClose}>{r}</Link>)}</div>
                </div>
              )}
              <div className="search-group">
                <h3>Browse by form</h3>
                <div className="search-quick">{FORMS.map((f) => <Link key={f.slug} href={`/shop/${f.slug}`} onClick={onClose}>{f.name}</Link>)}</div>
              </div>
              <div className="search-group">
                <h3>Browse by concern</h3>
                <div className="search-quick">{CONCERNS.map((c) => <Link key={c.slug} href={`/concerns/${c.slug}`} onClick={onClose}>{c.name}</Link>)}</div>
              </div>
            </>
          )}

          {res && res.queries.length > 0 && (
            <div className="search-group">
              <h3>Suggestions</h3>
              <ul className="search-list">
                {res.queries.slice(0, 4).map((q) => (
                  <li key={q.text}>
                    <a className="search-opt q" href={`/search?q=${encodeURIComponent(q.text)}`} {...optProps(`q-${q.text}`)}
                      onClick={(e) => { e.preventDefault(); go(`/search?q=${encodeURIComponent(q.text)}`, q.text); }}>
                      <SearchIcon /><span dangerouslySetInnerHTML={{ __html: q.styledText.replace(/<(?!\/?mark>)[^>]+>/g, '') }} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {res && res.products.length > 0 && (
            <div className="search-group">
              <h3>Medicines</h3>
              <ul className="search-list">
                {res.products.map((p) => (
                  <li key={p.id}>
                    <a className="search-opt" href={`/products/${p.handle}`} {...optProps(p.id)}
                      onClick={(e) => { e.preventDefault(); go(`/products/${p.handle}`, t); }}>
                      <span className="img">{p.featuredImage && <Image src={p.featuredImage.url} alt="" width={48} height={48} />}</span>
                      <span>{titleCase(p.title)}<small>{formByType(p.productType)?.name ?? titleCase(p.productType)}{!p.availableForSale ? ' · out of stock' : ''}</small></span>
                      <span className="pr">{money(p.priceRange.minVariantPrice, { compact: true })}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {res && res.collections.length > 0 && (
            <div className="search-group">
              <h3>Collections</h3>
              <ul className="search-list">
                {res.collections.map((c) => {
                  const href = c.handle.startsWith('concern-') ? `/concerns/${c.handle.slice(8)}` : `/collections/${c.handle}`;
                  return (
                    <li key={c.handle}>
                      <a className="search-opt q" href={href} {...optProps(`c-${c.handle}`)} onClick={(e) => { e.preventDefault(); go(href, t); }}>
                        <span aria-hidden="true">→</span><span>{titleCase(c.title)}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {loading && !res && <p className="search-group muted">Searching…</p>}
          {nothing && (
            <div className="empty">
              <h3>No medicines match “{t}”</h3>
              <p className="muted">Try another spelling, or browse the full A–Z list.</p>
              <Link className="btn-quiet btn-sm" href="/medicines" onClick={onClose}>Medicines A–Z</Link>
            </div>
          )}
          {options.length > 0 && (
            <p className="search-group">
              <a className="link" href={`/search?q=${encodeURIComponent(t)}`} onClick={(e) => { e.preventDefault(); go(`/search?q=${encodeURIComponent(t)}`, t); }}>See all results for “{t}” →</a>
            </p>
          )}
        </div>
        <div className="search-foot" aria-hidden="true"><span>↑ ↓ to move · Enter to open</span><span>Esc to close</span></div>
      </div>
    </div>
  );
}
