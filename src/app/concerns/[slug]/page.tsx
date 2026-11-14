import type { Metadata } from 'next';
import { GlovedaBanner } from '@/components/Gloveda';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listingFromParams } from '@/lib/shopify/catalog';
import { applyListing, concernProducts } from '@/lib/concerns';
import { CONCERNS, CONTACT, FORMS, breadcrumbLd, concernBySlug, faqLd } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { Listing } from '@/components/Listing';
import { JsonLd } from '@/components/JsonLd';
import { DoctorIcon } from '@/components/Icons';
import { KitCard } from '@/components/Kits';
import { getKits } from '@/lib/kits';
import { CONCERN_INTROS } from '@/content/concerns';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const formType = (slug: string) => FORMS.find((f) => f.slug === slug)?.type;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = concernBySlug((await params).slug);
  if (!c) return { title: 'Not found' };
  return {
    title: `${c.name}: Ayurveda medicines`,
    description: `${c.name} (${c.note.toLowerCase()}): Ayurveda medicines from AVVVS, Kozhikode, grouped by our pharmacists.`,
    alternates: { canonical: `/concerns/${c.slug}` },
  };
}

export default async function ConcernPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = concernBySlug(slug);
  if (!c) notFound();
  const listing = listingFromParams(await searchParams, formType);
  const [{ products }, kits] = await Promise.all([concernProducts(slug), getKits(slug)]);
  const page = applyListing(products, listing);
  const intro = CONCERN_INTROS[slug];

  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Shop by concern', href: '/concerns' }, { name: c.name }]} />
        <div className="head-row">
          <div style={{ display: 'grid', gap: 10 }}>
            <h1>{c.name}</h1>
            <p className="head-lede">{intro?.intro ?? `${c.note}. Ayurveda medicines that AVVVS traditionally recommends in this area.`}</p>
          </div>
          <a className="btn-quiet" href={CONTACT.clinic} rel="noopener"><DoctorIcon className="" /> Consult a doctor</a>
        </div>
        <div className="caution" role="note">
          <p>This group is a way to browse, not a diagnosis. Please choose medicines with a doctor’s advice, especially for children, during pregnancy, or alongside other treatment.</p>
        </div>
      </header>
      {kits.length > 0 && (
        <section aria-labelledby="kits-h" style={{ marginBottom: 48 }}>
          <div className="section-head" data-anim><div><h2 id="kits-h">Care kits</h2><p>Put together by our pharmacists.</p></div></div>
          <div className="kits">{kits.map((k) => <KitCard key={k.handle} kit={k} />)}</div>
        </section>
      )}
      {products.length ? (
        <Listing name={c.name} initial={page} filters={page.filters} listing={listing} source={{ kind: 'products' }} showForms
          sorts={[{ value: 'featured', label: 'In stock first' }, { value: 'name', label: 'Name, A to Z' }, { value: 'price-asc', label: 'Price, low to high' }, { value: 'price-desc', label: 'Price, high to low' }]} />
      ) : (
        <div className="empty" style={{ paddingBottom: 100 }}>
          <h2>Coming soon</h2>
          <p className="muted" style={{ maxWidth: '34rem' }}>Our pharmacists are still choosing the medicines for this department. Meanwhile, a doctor at the AVVVS Ayur Clinic can advise you, or you can find a medicine by name.</p>
          <div className="hero-actions">
            <a className="btn" href={CONTACT.clinic} rel="noopener">Consult a doctor</a>
            <Link className="btn-quiet" href="/medicines">Medicines A to Z</Link>
          </div>
        </div>
      )}
      {slug === 'skin-and-hair' && <div className="section"><GlovedaBanner /></div>}
      <nav className="section" aria-label="Other concerns" style={{ paddingTop: 0 }}>
        <p className="label" style={{ marginBottom: 12 }}>Other concerns</p>
        <div className="tags">{CONCERNS.filter((x) => x.slug !== slug).map((x) => <Link key={x.slug} href={`/concerns/${x.slug}`}>{x.name}</Link>)}</div>
      </nav>
      <JsonLd data={breadcrumbLd([{ name: 'Shop by concern', path: '/concerns' }, { name: c.name, path: `/concerns/${slug}` }])} />
      {intro?.faq?.length ? <JsonLd data={faqLd(intro.faq)} /> : null}
    </div>
  );
}
