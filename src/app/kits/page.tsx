import type { Metadata } from 'next';
import Link from 'next/link';
import { getKits } from '@/lib/kits';
import { CONTACT, breadcrumbLd } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';
import { KitCard } from '@/components/Kits';

export const revalidate = 600;
export const metadata: Metadata = {
  title: 'Care kits',
  description: 'Care kits from AVVVS: medicines that our pharmacists suggest together, ready to add to your cart in one step.',
  alternates: { canonical: '/kits' },
};

export default async function Kits() {
  const kits = await getKits();
  return (
    <div className="wrap" style={{ paddingBottom: 90 }}>
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Care kits' }]} />
        <h1>Care kits</h1>
        <p className="head-lede">Medicines that AVVVS’s pharmacists suggest together. Add a whole kit in one step, and ask a doctor if you’re unsure whether it suits you.</p>
      </header>
      {kits.length ? (
        <div className="kits">{kits.map((k) => <KitCard key={k.handle} kit={k} />)}</div>
      ) : (
        <div className="empty">
          <h2>Care kits are coming soon</h2>
          <p className="muted" style={{ maxWidth: '34rem' }}>Our pharmacists are putting the first kits together. Meanwhile, browse by concern, or ask a doctor at the AVVVS Ayur Clinic.</p>
          <div className="hero-actions">
            <Link className="btn" href="/concerns">Shop by concern</Link>
            <a className="btn-quiet" href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
          </div>
        </div>
      )}
      <JsonLd data={breadcrumbLd([{ name: 'Care kits', path: '/kits' }])} />
    </div>
  );
}
