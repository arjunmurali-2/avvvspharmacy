import type { Metadata } from 'next';
import Link from 'next/link';
import { safe } from '@/lib/shopify/client';
import { concernCounts } from '@/lib/concerns';
import { CONCERNS, CONTACT, breadcrumbLd } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';

export const revalidate = 600;
export const metadata: Metadata = {
  title: 'Shop by concern',
  description: 'Ayurveda medicines from AVVVS grouped by concern, the way a hospital groups its departments: pain management, digestion, respiratory care, skin and hair, women’s and children’s health and more.',
  alternates: { canonical: '/concerns' },
};

export default async function Concerns() {
  const counts = await safe(concernCounts(), {} as Record<string, number>);
  return (
    <div className="wrap" style={{ paddingBottom: 90 }}>
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Shop by concern' }]} />
        <h1>Shop by concern</h1>
        <p className="head-lede">Medicines grouped by AVVVS’s pharmacists into departments, as a hospital would. These groups help you browse; they are not a diagnosis. For anything ongoing, <a href={CONTACT.clinic} rel="noopener">consult a doctor</a> first.</p>
      </header>
      <ol className="concerns" data-anim="stagger">
        {CONCERNS.map((c, i) => (
          <li key={c.slug}>
            <Link href={`/concerns/${c.slug}`}>
              <b>{c.name}</b>
              <small>{c.note}</small>
              <span className="soon">{counts[c.slug] ? `${counts[c.slug]} medicine${counts[c.slug] === 1 ? '' : 's'}` : 'Being prepared by our pharmacists'}</span>
            </Link>
          </li>
        ))}
      </ol>
      <JsonLd data={breadcrumbLd([{ name: 'Shop by concern', path: '/concerns' }])} />
    </div>
  );
}
