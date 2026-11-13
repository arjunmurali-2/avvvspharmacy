'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AvvvsLockup } from './Logo';
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';
import { useStore } from './StoreProvider';
import { SearchOverlay } from './SearchOverlay';
import { SEARCH_EVENT } from './HomeParts';
import { usePop } from './Motion';
import { COLLECTIONS, CONCERNS, CONTACT, FORMS, MAIN_SITE } from '@/lib/site';

/** The store's bar: a mega-menu on wide screens, a sheet on phones, search, account, wishlist and cart. */
export function Header() {
  const { cart, openDrawer, wishlist, signedIn } = useStore();
  const path = usePathname();
  const bar = useRef<HTMLElement>(null);
  const [mega, setMega] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [search, setSearch] = useState(false);
  const count = cart?.totalQuantity ?? 0;
  const pop = usePop(count);

  // close menus on navigation
  useEffect(() => { setMega(false); setSheet(false); setSearch(false); }, [path]);

  // tuck away on a deliberate scroll down; any scroll up brings it back
  useEffect(() => {
    const el = bar.current!;
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) {
        el.classList.toggle('is-tucked', y > last && y > 240 && !el.contains(document.activeElement) && !el.querySelector('.mega:not([hidden])'));
        last = y;
      }
      el.classList.toggle('is-scrolled', y > 8);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // keyboard: "/" or Ctrl/Cmd+K opens search; Escape closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); setSearch(true); }
      if (e.key === 'Escape') { setMega(false); setSheet(false); }
    };
    const onOpen = () => setSearch(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(SEARCH_EVENT, onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener(SEARCH_EVENT, onOpen); };
  }, []);

  useEffect(() => {
    if (!mega) return;
    const onDown = (e: MouseEvent) => { if (!bar.current?.contains(e.target as Node)) setMega(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [mega]);

  useEffect(() => {
    document.documentElement.style.overflow = sheet ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [sheet]);

  const cur = (href: string) => (path === href || path.startsWith(`${href}/`) ? 'page' : undefined);

  return (
    <>
      <header className="bar" ref={bar}>
        <div className="bar-row">
          <Link className="bar-mark" href="/" aria-label="AVVVS Ayur Store, home">
            <AvvvsLockup height={38} alt="" />
            <span className="bar-mark-label">Ayur Store</span>
          </Link>

          <nav className="bar-nav" aria-label="Main">
            <button type="button" aria-expanded={mega} aria-controls="mega" onClick={() => setMega((m) => !m)}>
              Shop<span className="caret" aria-hidden="true">▾</span>
            </button>
            <Link href="/concerns" aria-current={cur('/concerns')}>By concern</Link>
            <Link href="/medicines" aria-current={cur('/medicines')}>Medicines A–Z</Link>
            <Link className="nav-wide" href="/collections/classical" aria-current={cur('/collections/classical')}>Classical</Link>
            <a href={CONTACT.clinic} rel="noopener">Consult a doctor <span aria-hidden="true">↗</span></a>
          </nav>

          <div className="bar-end">
            <button type="button" className="bar-search" onClick={() => setSearch(true)} aria-label="Search medicines">
              <SearchIcon /><span>Search medicines</span><kbd>/</kbd>
            </button>
            <Link className="icon-btn hide-xs" href={signedIn ? '/account' : '/account/login'} prefetch={false} aria-label={signedIn ? 'Your account' : 'Sign in'}>
              <UserIcon />
            </Link>
            <Link className="icon-btn hide-xs" href="/wishlist" aria-label={`Wishlist, ${wishlist.length} saved`}>
              <HeartIcon />{wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>
            <button type="button" className="icon-btn" onClick={openDrawer} aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
              <BagIcon />{count > 0 && <span className="badge" ref={pop}>{count}</span>}
            </button>
            <button type="button" className="icon-btn bar-menu" onClick={() => setSheet(true)} aria-label="Menu" aria-expanded={sheet} aria-controls="sheet">
              <MenuIcon />
            </button>
          </div>
        </div>
        <span className="bar-thread" aria-hidden="true" />

        <div className="mega" id="mega" hidden={!mega}>
          <div className="mega-grid">
            <div className="mega-concerns">
              <h2>Shop by concern</h2>
              <ul>
                {CONCERNS.map((c) => <li key={c.slug}><Link href={`/concerns/${c.slug}`}>{c.name}<small>{c.note}</small></Link></li>)}
              </ul>
            </div>
            <div className="mega-forms">
              <h2>Shop by form</h2>
              <ul>
                {FORMS.map((f) => <li key={f.slug}><Link href={`/shop/${f.slug}`}>{f.name}<small>{f.note}</small></Link></li>)}
              </ul>
            </div>
            <div>
              <h2>Collections</h2>
              <ul>
                {COLLECTIONS.map((c) => <li key={c.handle}><Link href={`/collections/${c.handle}`}>{c.name}<small>{c.note}</small></Link></li>)}
                <li><Link href="/kits">Care kits<small>Put together by our pharmacists</small></Link></li>
                <li><Link href="/medicines">Every medicine, A–Z<small>Find a medicine by name</small></Link></li>
              </ul>
            </div>
            <div className="mega-foot">
              <a href={CONTACT.clinic} rel="noopener">Not sure what you need? Consult an AVVVS doctor ↗</a>
              <Link href="/cart">Upload a prescription with your order</Link>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">Order on WhatsApp ↗</a>
            </div>
          </div>
        </div>
      </header>

      <div className="sheet" id="sheet" hidden={!sheet} role="dialog" aria-modal="true" aria-label="Menu">
        <button type="button" className="scrim" aria-label="Close menu" onClick={() => setSheet(false)} />
        <div className="sheet-panel" data-lenis-prevent>
          <div className="sheet-head">
            <AvvvsLockup height={30} alt="AVVVS" />
            <button type="button" className="icon-btn" onClick={() => setSheet(false)} aria-label="Close menu"><CloseIcon /></button>
          </div>
          <button type="button" className="hero-search" onClick={() => { setSheet(false); setSearch(true); }}>
            <SearchIcon /><span>Search medicines</span>
          </button>
          <div>
            <details open>
              <summary>By concern</summary>
              <ul>{CONCERNS.map((c) => <li key={c.slug}><Link href={`/concerns/${c.slug}`}>{c.name}</Link></li>)}</ul>
            </details>
            <details>
              <summary>By form</summary>
              <ul>{FORMS.map((f) => <li key={f.slug}><Link href={`/shop/${f.slug}`}>{f.name}</Link></li>)}</ul>
            </details>
            <details>
              <summary>Collections</summary>
              <ul>{COLLECTIONS.map((c) => <li key={c.handle}><Link href={`/collections/${c.handle}`}>{c.name}</Link></li>)}</ul>
            </details>
          </div>
          <nav className="sheet-links" aria-label="More">
            <Link href="/medicines">Medicines A–Z</Link>
            <Link href={signedIn ? '/account' : '/account/login'} prefetch={false}>{signedIn ? 'Your account' : 'Sign in'}</Link>
            {signedIn && <Link href="/account/orders">Your orders</Link>}
            <Link href="/wishlist">Wishlist{wishlist.length ? ` (${wishlist.length})` : ''}</Link>
            <a href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
            <a href={MAIN_SITE} rel="noopener">avvvs.com ↗</a>
          </nav>
          <div className="sheet-contact">
            <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`}>{CONTACT.phones[0]}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>
        </div>
      </div>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
