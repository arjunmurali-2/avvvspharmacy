import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCollectionPage, listingFromParams } from '@/lib/shopify/catalog';
import { COLLECTIONS, CONCERN_PREFIX, FORMS, breadcrumbLd } from '@/lib/site';
import { stripHtml, titleCase } from '@/lib/format';
import { Crumbs } from '@/components/Crumbs';
import { Listing } from '@/components/Listing';
import { JsonLd } from '@/components/JsonLd';

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const formType = (slug: string) => FORMS.find((f) => f.slug === slug)?.type;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const r = await getCollectionPage(handle, { first: 1 }).catch(() => null);
  if (!r) return { title: 'Collection not found' };
  const known = COLLECTIONS.find((c) => c.handle === handle);
  const title = r.collection.seo.title || known?.name || titleCase(r.collection.title);
  return {
    title,
    description: r.collection.seo.description || stripHtml(r.collection.description).slice(0, 160) || `${title}: Ayurveda medicines from AVVVS, Kozhikode.`,
    alternates: { canonical: `/collections/${handle}` },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  if (handle.startsWith(CONCERN_PREFIX)) redirect(`/concerns/${handle.slice(CONCERN_PREFIX.length)}`);
  const listing = listingFromParams(await searchParams, formType);
  const r = await getCollectionPage(handle, listing);
  if (!r) notFound();
  const known = COLLECTIONS.find((c) => c.handle === handle);
  const name = known?.name || titleCase(r.collection.title);
  const lede = stripHtml(r.collection.descriptionHtml) || known?.note;

  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Collections' }, { name }]} />
        <h1>{name}</h1>
        {lede && <p className="head-lede">{lede}</p>}
      </header>
      <Listing name={name} initial={r.page} filters={r.page.filters} listing={listing} source={{ kind: 'collection', handle }} showForms />
      <JsonLd data={breadcrumbLd([{ name, path: `/collections/${handle}` }])} />
    </div>
  );
}
