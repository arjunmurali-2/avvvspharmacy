import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts, listingFromParams, searchProducts } from '@/lib/shopify/catalog';
import { applyListing } from '@/lib/concerns';
import { matchSymptoms } from '@/lib/symptoms';
import type { ProductPage } from '@/lib/shopify/types';
import { FORMS } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { Listing } from '@/components/Listing';
import { HeroSearch } from '@/components/HomeParts';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const formType = (slug: string) => FORMS.find((f) => f.slug === slug)?.type;
const one = (v: string | string[] | undefined) => String(Array.isArray(v) ? v[0] : v ?? '').trim().slice(0, 100);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = one((await searchParams).q);
  return { title: q ? `Search: ${q}` : 'Search', robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = one(sp.q);
  const listing = listingFromParams(sp, formType);
  const sym = q ? matchSymptoms(q) : null;
  let page: ProductPage | null = null;
  if (q && sym?.hits.length) {
    // a symptom search: Shopify's name matches first, then medicines whose uses match, all at once
    const [shop, all] = await Promise.all([searchProducts(q, { first: 250 }), getAllProducts()]);
    const byHandle = new Map(all.map((p) => [p.handle, p]));
    const seen = new Set(shop.products.map((p) => p.handle));
    const merged = [...shop.products, ...sym.hits.filter((h) => !seen.has(h.handle) && byHandle.has(h.handle)).map((h) => byHandle.get(h.handle)!)];
    page = applyListing(merged, listing, { keepOrder: !listing.sort || listing.sort === 'featured' });
  } else if (q) {
    page = await searchProducts(q, listing);
  }

  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Search' }]} />
        <h1>{q ? <>Results for “{q}”</> : 'Search the pharmacy'}</h1>
        <HeroSearch />
        {sym && sym.concerns.length > 0 && (
          <nav className="tags" aria-label="Matching concerns">
            {sym.concerns.map((c) => <Link key={c.slug} href={`/concerns/${c.slug}`}>Shop by concern: {c.name}</Link>)}
          </nav>
        )}
      </header>
      {page ? (
        <Listing key={q} name={`Search: ${q}`} initial={page} filters={page.filters} listing={listing} source={{ kind: 'search', term: q }} showForms
          sorts={[{ value: 'featured', label: 'Best match' }, { value: 'price-asc', label: 'Price, low to high' }, { value: 'price-desc', label: 'Price, high to low' }]}
          emptyNote={<p className="muted">Ayurveda names are spelled many ways (Dhanwantharam, Dhanvantaram). Try a shorter part of the name, or look it up in the A to Z list.</p>} />
      ) : (
        <div className="empty" style={{ paddingBottom: 100 }}>
          <p className="muted">Type a medicine name above, or browse by form:</p>
          <div className="tags">{FORMS.map((f) => <Link key={f.slug} href={`/shop/${f.slug}`}>{f.name}</Link>)}</div>
        </div>
      )}
    </div>
  );
}
