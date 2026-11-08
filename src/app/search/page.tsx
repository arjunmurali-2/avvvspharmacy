import type { Metadata } from 'next';
import Link from 'next/link';
import { listingFromParams, searchProducts } from '@/lib/shopify/catalog';
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
  const page = q ? await searchProducts(q, listing) : null;

  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Search' }]} />
        <h1>{q ? <>Results for “{q}”</> : 'Search the pharmacy'}</h1>
        <HeroSearch />
      </header>
      {page ? (
        <Listing key={q} name={`Search: ${q}`} initial={page} filters={page.filters} listing={listing} source={{ kind: 'search', term: q }} showForms
          sorts={[{ value: 'featured', label: 'Best match' }, { value: 'price-asc', label: 'Price, low to high' }, { value: 'price-desc', label: 'Price, high to low' }]}
          emptyNote={<p className="muted">Ayurveda names are spelled many ways (Dhanwantharam, Dhanvantaram). Try a shorter part of the name, or look it up in the A–Z list.</p>} />
      ) : (
        <div className="empty" style={{ paddingBottom: 100 }}>
          <p className="muted">Type a medicine name above, or browse by form:</p>
          <div className="tags">{FORMS.map((f) => <Link key={f.slug} href={`/shop/${f.slug}`}>{f.name}</Link>)}</div>
        </div>
      )}
    </div>
  );
}
