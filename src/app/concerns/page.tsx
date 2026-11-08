import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollections } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import { CONCERNS, CONCERN_PREFIX, CONTACT, breadcrumbLd } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';

export const revalidate = 600;
export const metadata: Metadata = {
  title: 'Shop by concern',
  description: 'Ayurveda medicines from AVVVS grouped by concern, the way a hospital groups its departments: pain management, digestion, respiratory care, skin and hair, women’s and children’s health and more.',
  alternates: { canonical: '/concerns' },
};

export default async function Concerns() {
  const live = new Set((await safe(getCollections(), [])).filter((c) => c.handle.startsWith(CONCERN_PREFIX) && c.count > 0).map((c) => c.handle.slice(CONCERN_PREFIX.length)));
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
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <b>{c.name}</b>
              <span className="go" aria-hidden="true">→</span>
              <small>{c.note}</small>
              {!live.has(c.slug) && <span className="soon">Being prepared by our pharmacists</span>}
            </Link>
          </li>
        ))}
      </ol>
      <JsonLd data={breadcrumbLd([{ name: 'Shop by concern', path: '/concerns' }])} />
    </div>
  );
}
