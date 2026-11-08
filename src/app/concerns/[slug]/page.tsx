import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollectionPage, listingFromParams } from '@/lib/shopify/catalog';
import { CONCERNS, CONCERN_PREFIX, CONTACT, FORMS, breadcrumbLd, concernBySlug } from '@/lib/site';
import { stripHtml, titleCase } from '@/lib/format';
import { Crumbs } from '@/components/Crumbs';
import { Listing } from '@/components/Listing';
import { JsonLd } from '@/components/JsonLd';
import { DoctorIcon } from '@/components/Icons';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const formType = (slug: string) => FORMS.find((f) => f.slug === slug)?.type;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = concernBySlug(slug);
  const r = await getCollectionPage(CONCERN_PREFIX + slug, { first: 1 }).catch(() => null);
  if (!c && !r) return { title: 'Not found' };
  const name = c?.name ?? titleCase(r!.collection.title);
  return {
    title: `${name}: Ayurveda medicines`,
    description: r?.collection.seo.description || `${name}: Ayurveda medicines from AVVVS, Kozhikode, grouped by our pharmacists.`,
    alternates: { canonical: `/concerns/${slug}` },
  };
}

export default async function ConcernPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = concernBySlug(slug);
  const listing = listingFromParams(await searchParams, formType);
  const r = await getCollectionPage(CONCERN_PREFIX + slug, listing).catch(() => null);
  if (!c && !r) notFound();
  const name = c?.name ?? titleCase(r!.collection.title);
  const lede = (r && stripHtml(r.collection.descriptionHtml)) || c?.note;
  const filtered = !!(listing.inStock || listing.min || listing.max || listing.type);
  const ready = !!r && (r.page.products.length > 0 || filtered);

  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Shop by concern', href: '/concerns' }, { name }]} />
        <div className="head-row">
          <div style={{ display: 'grid', gap: 10 }}>
            <h1>{name}</h1>
            {lede && <p className="head-lede">{lede}</p>}
          </div>
          <a className="btn-quiet" href={CONTACT.clinic} rel="noopener"><DoctorIcon className="" /> Consult a doctor ↗</a>
        </div>
        <div className="caution" role="note">
          <p>This group is a way to browse, not a diagnosis. Choose medicines with a doctor’s advice, especially for children, during pregnancy, or alongside other treatment.</p>
        </div>
      </header>
      {ready ? (
        <Listing name={name} initial={r!.page} filters={r!.page.filters} listing={listing} source={{ kind: 'collection', handle: CONCERN_PREFIX + slug }} showForms />
      ) : (
        <div className="empty" style={{ paddingBottom: 100 }}>
          <h2>Coming soon</h2>
          <p className="muted" style={{ maxWidth: '34rem' }}>Our pharmacists are still choosing the medicines for this department. Meanwhile, a doctor at the AVVVS Ayur Clinic can advise you, or you can find a medicine by name.</p>
          <div className="hero-actions">
            <a className="btn" href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
            <Link className="btn-quiet" href="/medicines">Medicines A–Z</Link>
          </div>
        </div>
      )}
      <nav className="section" aria-label="Other concerns" style={{ paddingTop: 0 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Other concerns</p>
        <div className="tags">{CONCERNS.filter((x) => x.slug !== slug).map((x) => <Link key={x.slug} href={`/concerns/${x.slug}`}>{x.name}</Link>)}</div>
      </nav>
      <JsonLd data={breadcrumbLd([{ name: 'Shop by concern', path: '/concerns' }, { name, path: `/concerns/${slug}` }])} />
    </div>
  );
}
