import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts, listingFromParams } from '@/lib/shopify/catalog';
import { FORMS, breadcrumbLd } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { Listing } from '@/components/Listing';
import { JsonLd } from '@/components/JsonLd';

type Props = { params: Promise<{ form: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { form } = await params;
  const f = FORMS.find((x) => x.slug === form);
  if (!f) return { title: 'Not found' };
  return {
    title: `${f.name}: ${f.note}`,
    description: `Buy ${f.name.toLowerCase()} (${f.note.toLowerCase()}) online from AVVVS, Kozhikode: authentic Ayurveda medicines made in our own GMP-certified factory.`,
    alternates: { canonical: `/shop/${f.slug}` },
  };
}

export default async function FormPage({ params, searchParams }: Props) {
  const { form } = await params;
  const f = FORMS.find((x) => x.slug === form);
  if (!f) notFound();
  const base = listingFromParams(await searchParams);
  const listing = { ...base, type: f.type, sort: base.sort ?? ('name' as const) };
  const page = await getProducts(listing);

  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Forms', href: '/medicines' }, { name: f.name }]} />
        <div className="head-row">
          <div style={{ display: 'grid', gap: 10 }}>
            <h1>{f.name}</h1>
            {f.ml && <p className="ml" lang="ml">{f.ml}</p>}
            <p className="head-lede">{f.note}, prepared by AVVVS in Kozhikode.</p>
          </div>
          <nav className="tags" aria-label="Other forms">
            {FORMS.filter((x) => x.slug !== f.slug).map((x) => <Link key={x.slug} href={`/shop/${x.slug}`}>{x.name}</Link>)}
          </nav>
        </div>
      </header>
      <Listing name={f.name} initial={page} listing={listing} source={{ kind: 'products' }}
        sorts={[{ value: 'name', label: 'Name, A to Z' }, { value: 'featured', label: 'Most ordered' }, { value: 'price-asc', label: 'Price, low to high' }, { value: 'price-desc', label: 'Price, high to low' }, { value: 'newest', label: 'Newest' }]} />
      <JsonLd data={breadcrumbLd([{ name: f.name, path: `/shop/${f.slug}` }])} />
    </div>
  );
}
