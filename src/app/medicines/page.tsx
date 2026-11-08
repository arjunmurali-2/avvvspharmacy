import type { Metadata } from 'next';
import { getAllProducts } from '@/lib/shopify/catalog';
import { breadcrumbLd } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';
import { AZIndex } from '@/components/AZIndex';

export const revalidate = 600;
export const metadata: Metadata = {
  title: 'Medicines A–Z',
  description: 'Every Ayurveda medicine in the AVVVS pharmacy, from A to Z: kashayam, arishtam, thailam, choornam, lehyam, ghritham and more.',
  alternates: { canonical: '/medicines' },
};

export default async function Medicines() {
  const products = await getAllProducts();
  const rows = products.map((p) => ({ handle: p.handle, title: p.title, type: p.productType, available: p.availableForSale, price: p.priceRange.minVariantPrice }));
  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Medicines A–Z' }]} />
        <h1>Medicines A–Z</h1>
        <p className="head-lede">All {products.length} medicines in the AVVVS pharmacy, by name. Filter by form, or type part of a name.</p>
      </header>
      <AZIndex rows={rows} />
      <JsonLd data={breadcrumbLd([{ name: 'Medicines A–Z', path: '/medicines' }])} />
    </div>
  );
}
