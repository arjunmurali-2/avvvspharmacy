'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { loadMore } from '@/app/actions';
import type { Listing as L, Sort } from '@/lib/shopify/catalog';
import type { Filter, ProductCard, ProductPage } from '@/lib/shopify/types';
import { FORMS } from '@/lib/site';
import { trackViewList } from '@/lib/track';
import { CloseIcon } from './Icons';
import { ProductGrid, itemOf } from './ProductTile';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name, A to Z' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'newest', label: 'Newest' },
];

type Source = Parameters<typeof loadMore>[0];

/**
 * A product listing with its filters. Every filter lives in the URL (?stock=1&min=&max=&form=&sort=),
 * so a filtered view can be shared or bookmarked; "Show more" pages on in place.
 */
export function Listing({ name, initial, source, listing, filters, showForms, sorts = SORTS, emptyNote }: {
  name: string;
  initial: ProductPage;
  source: Source;
  listing: L;
  filters?: Filter[];
  showForms?: boolean;
  sorts?: { value: Sort; label: string }[];
  emptyNote?: React.ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [products, setProducts] = useState<ProductCard[]>(initial.products);
  const [cursor, setCursor] = useState(initial.pageInfo);
  const [pending, start] = useTransition();
  const [routing, startRoute] = useTransition();
  const [open, setOpen] = useState(false);

  // a new filter or sort brings a new first page from the server
  useEffect(() => { setProducts(initial.products); setCursor(initial.pageInfo); }, [initial]);
  useEffect(() => { trackViewList(name, initial.products.map(itemOf)); }, [name, initial]);

  const href = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v === null || v === '') next.delete(k); else next.set(k, v); }
    const q = next.toString();
    return q ? `${path}?${q}` : path;
  };
  const nav = (patch: Record<string, string | null>) => startRoute(() => router.push(href(patch), { scroll: false }));

  const more = () => start(async () => {
    const page = await loadMore(source, { ...listing, after: cursor.endCursor });
    setProducts((p) => [...p, ...page.products.filter((n) => !p.some((x) => x.id === n.id))]);
    setCursor(page.pageInfo);
  });

  const priceFilter = filters?.find((f) => f.type === 'PRICE_RANGE');
  const ceiling = (() => { try { return Math.ceil(JSON.parse(priceFilter?.values[0]?.input ?? '{}').price?.max ?? 0); } catch { return 0; } })();
  const stockFilter = filters?.find((f) => f.id === 'filter.v.availability');
  const inStockCount = stockFilter?.values.find((v) => v.input.includes('true'))?.count;
  // on a form page the form is the page itself, not a filter
  const active = [listing.inStock, listing.min, listing.max, showForms ? listing.type : undefined].filter(Boolean).length;
  const currentForm = sp.get('form');

  const facets = (
    <aside className={`facets${open ? ' is-open' : ''}`} aria-label="Filters" data-lenis-prevent>
      <div className="facets-close"><h2 style={{ fontSize: '1.4rem' }}>Filters</h2><button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close filters"><CloseIcon /></button></div>
      <div className="facet">
        <h3>Availability</h3>
        <label className="check">
          <input type="checkbox" checked={!!listing.inStock} onChange={(e) => nav({ stock: e.target.checked ? '1' : null })} />
          In stock only{typeof inStockCount === 'number' && !listing.inStock ? <span className="muted"> ({inStockCount})</span> : null}
        </label>
      </div>
      {showForms && (
        <div className="facet">
          <h3>Form</h3>
          <ul>
            <li><Link href={href({ form: null })} scroll={false} aria-current={!currentForm ? 'true' : undefined}>All forms</Link></li>
            {FORMS.map((f) => <li key={f.slug}><Link href={href({ form: f.slug })} scroll={false} aria-current={currentForm === f.slug ? 'true' : undefined}>{f.name}</Link></li>)}
          </ul>
        </div>
      )}
      <form className="facet" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); nav({ min: String(d.get('min') || ''), max: String(d.get('max') || '') }); setOpen(false); }}>
        <h3>Price (₹)</h3>
        <div className="price-row">
          <input className="input" name="min" type="number" inputMode="numeric" min={0} placeholder="Min" defaultValue={listing.min ?? ''} aria-label="Minimum price" key={`min-${listing.min}`} />
          <span aria-hidden="true">to</span>
          <input className="input" name="max" type="number" inputMode="numeric" min={0} placeholder={ceiling ? String(ceiling) : 'Max'} defaultValue={listing.max ?? ''} aria-label="Maximum price" key={`max-${listing.max}`} />
        </div>
        <button type="submit" className="btn-quiet btn-sm">Apply price</button>
      </form>
      {active > 0 && <Link className="link" href={href({ stock: null, min: null, max: null, form: null })} scroll={false}>Clear all filters</Link>}
    </aside>
  );

  return (
    <div className="listing">
      {facets}
      <div>
        <div className="toolbar">
          <div className="toolbar-l">
            <button type="button" className="btn-quiet btn-sm filters-btn" onClick={() => setOpen(true)} aria-expanded={open}>Filters{active ? ` (${active})` : ''}</button>
            <p className="count" aria-live="polite">
              {routing ? 'Updating…' : initial.total !== undefined ? `${initial.total} result${initial.total === 1 ? '' : 's'}` : `${products.length}${cursor.hasNextPage ? '+' : ''} medicine${products.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <label className="toolbar-l">
            <span className="sr-only">Sort by</span>
            <select className="select" value={listing.sort ?? sorts[0].value} onChange={(e) => nav({ sort: e.target.value === sorts[0].value ? null : e.target.value })}>
              {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div style={{ opacity: routing ? 0.5 : 1, transition: 'opacity .2s' }}>
          {products.length ? <ProductGrid products={products} priority={4} /> : (
            <div className="empty">
              <h3>Nothing matches these filters</h3>
              {emptyNote ?? <p className="muted">Try removing a filter, or browse every medicine A to Z.</p>}
              {active > 0 ? <Link className="btn-quiet" href={href({ stock: null, min: null, max: null, form: null })}>Clear filters</Link> : <Link className="btn-quiet" href="/medicines">Medicines A to Z</Link>}
            </div>
          )}
        </div>

        {cursor.hasNextPage && (
          <div className="more">
            <p className="fine">Showing {products.length}{initial.total ? ` of ${initial.total}` : ''}</p>
            <button type="button" className="btn-quiet" onClick={more} disabled={pending}>{pending ? 'Loading…' : 'Show more'}</button>
          </div>
        )}
      </div>
      {open && <button type="button" className="scrim" style={{ position: 'fixed', zIndex: 65 }} aria-label="Close filters" onClick={() => setOpen(false)} />}
    </div>
  );
}
