import Image from 'next/image';
import Link from 'next/link';
import { getCollectionPage, getProducts } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import type { ProductPage } from '@/lib/shopify/types';
import { COLLECTIONS, CONCERNS, CONTACT, FORMS, MAIN_SITE, ORG } from '@/lib/site';
import { money } from '@/lib/format';
import { medicineName } from '@/content/medicines';
import { GlovedaBanner } from '@/components/Gloveda';
import { ProductGrid } from '@/components/ProductTile';
import { HeroSearch, RecentlyViewed } from '@/components/HomeParts';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { fitted } from '@/lib/shopify/image';

export const revalidate = 300;

// everyday words the symptom search understands (src/content/synonyms.ts)
const TRY = ['back pain', 'hair fall', 'acidity', 'cough', 'joint pain'];

const EMPTY: ProductPage = { products: [], pageInfo: { hasNextPage: false, endCursor: null }, filters: [] };

export default async function Home() {
  const [classical, proprietary, popular] = await Promise.all([
    safe(getCollectionPage('classical', { inStock: true, first: 8 }).then((r) => r?.page ?? EMPTY), EMPTY),
    safe(getCollectionPage('proprietary', { inStock: true, first: 4 }).then((r) => r?.page ?? EMPTY), EMPTY),
    safe(getProducts({ inStock: true, sort: 'featured', first: 8 }), EMPTY),
  ]);
  const heroShots = [...popular.products, ...classical.products].filter((p) => p.featuredImage).filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy" data-anim>
            <h1>Ayurveda medicines, from our pharmacy to your door.</h1>
            <p className="lead">Classical and proprietary formulations from our own GMP-certified factory in Kerala.</p>
            <HeroSearch />
            <p className="hero-try">
              <span>Or search by what you feel:</span>
              {TRY.map((t) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}>{t}</Link>)}
            </p>
            <div className="hero-actions">
              <Link className="btn-quiet" href="/medicines">Browse medicines A to Z</Link>
              <a className="btn-quiet" href={CONTACT.clinic} rel="noopener">Consult a doctor</a>
            </div>
          </div>
          {heroShots.length > 0 && (
            <figure className="hero-art" data-anim="stagger">
              {heroShots.map((p, i) => (
                <Link key={p.id} href={`/products/${p.handle}`}>
                  <span className="niche"><Image src={fitted(p.featuredImage!.url)} alt="" fill sizes="(max-width: 900px) 30vw, 240px" priority={i < 2} /></span>
                  <span className="niche-cap"><b>{medicineName(p.handle, p.title)}</b><span>{money(p.priceRange.minVariantPrice, { compact: true })}</span></span>
                </Link>
              ))}
              <figcaption>The pharmacy’s most ordered medicines, in stock now.</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="band" aria-label="Pharmacy services">
        <ul className="wrap services" data-anim="stagger">
          <li><Link href="/cart"><b>Upload a prescription</b><span>Attach it to your order for our pharmacist</span></Link></li>
          <li><a href={CONTACT.clinic} rel="noopener"><b>Consult a doctor</b><span>At the AVVVS Ayur Speciality Clinic</span></a></li>
          <li><a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener"><b>Order on WhatsApp</b><span>Send your list to the pharmacy</span></a></li>
          <li><Link href="/concerns"><b>Shop by concern</b><span>Twelve departments of care</span></Link></li>
        </ul>
      </section>

      <section className="section wrap" aria-labelledby="forms-h">
        <div className="section-head" data-anim>
          <h2 id="forms-h">The Ayurveda pharmacy, by preparation</h2>
          <Link className="link" href="/medicines">Every medicine, A to Z</Link>
        </div>
        <ol className="forms" data-anim="stagger">
          {FORMS.map((f) => (
            <li key={f.slug}>
              <Link href={`/shop/${f.slug}`}>
                <b>{f.name}</b>
                {f.ml && <span className="ml" lang="ml">{f.ml}</span>}
                <span>{f.note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {popular.products.length > 0 && (
        <section className="section section-tight" aria-labelledby="pop-h">
          <div className="wrap section-head" data-anim>
            <h2 id="pop-h">Most ordered</h2>
            <Link className="link" href="/medicines">All medicines</Link>
          </div>
          <ProductGrid products={popular.products} className="grid rail" />
        </section>
      )}

      <section className="band" aria-labelledby="concern-h">
        <div className="wrap">
          <div className="section-head section-head-split" data-anim>
            <h2 id="concern-h">Find care by department</h2>
            <p className="lead">Medicines grouped by AVVVS’s pharmacists the way a hospital groups its departments. For anything ongoing, please consult a doctor first.</p>
          </div>
          <ol className="concerns" data-anim="stagger">
            {CONCERNS.map((c) => (
              <li key={c.slug}>
                <Link href={`/concerns/${c.slug}`}>
                  <b>{c.name}</b>
                  <small>{c.note}</small>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {classical.products.length > 0 && (
        <section className="section wrap" aria-labelledby="classical-h">
          <div className="section-head" data-anim>
            <h2 id="classical-h">From the classical texts</h2>
            <Link className="link" href="/collections/classical">See all classical</Link>
          </div>
          <ProductGrid products={classical.products} className="grid grid-4" />
        </section>
      )}

      <section className="section section-tight wrap range" aria-labelledby="coll-h">
        <h2 id="coll-h" data-anim>Browse the range</h2>
        <ul className="colls" data-anim="stagger">
          {COLLECTIONS.map((c) => <li key={c.handle}><Link href={`/collections/${c.handle}`}><b>{c.name}</b><span>{c.note}</span></Link></li>)}
        </ul>
      </section>

      <div className="section section-tight wrap"><GlovedaBanner /></div>

      {proprietary.products.length > 0 && (
        <section className="section section-tight wrap" aria-labelledby="prop-h">
          <div className="section-head" data-anim>
            <h2 id="prop-h">AVVVS formulations</h2>
            <Link className="link" href="/collections/proprietary">See all</Link>
          </div>
          <ProductGrid products={proprietary.products} className="grid grid-4" />
        </section>
      )}

      <RecentlyViewed />

      <section className="band section-deep" aria-labelledby="consult-h">
        <div className="wrap consult">
          <div className="consult-copy" data-anim>
            <h2 id="consult-h">Not sure which medicine is right for you?</h2>
            <p className="lead">Ayurveda treats the person, not only the complaint. Our doctors can advise on medicines, dosage and diet before you order.</p>
            <a className="btn-quiet" href={CONTACT.clinic} rel="noopener">Consult a doctor</a>
          </div>
          <ol className="consult-steps" data-anim="stagger">
            <li>Book a consultation at the AVVVS Ayur Speciality Clinic.</li>
            <li>Your doctor prescribes medicines, dosage and anupana.</li>
            <li>Order here, and attach the prescription to your cart for our pharmacist.</li>
          </ol>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="made-h">
        <div className="section-head section-head-split" data-anim>
          <h2 id="made-h">From our own factory, since {ORG.founded}</h2>
          <p className="lead">Every medicine here is prepared by Arya Vaidya Vilasini Vaidya Sala in Kozhikode, Kerala. See how they are made.</p>
        </div>
        <ul className="trust" data-anim="stagger">
          <li><b>Since {ORG.founded}</b><span>Three generations of Ayurveda in Kozhikode</span></li>
          <li><b>Made by AVVVS</b><span>In our own GMP-certified factory</span></li>
          <li><b>Secure checkout</b><span>Payments handled by Shopify</span></li>
          <li><b>Pharmacist help</b><span>Call or WhatsApp {CONTACT.phones[0]}</span></li>
        </ul>
        <div className="hero-actions">
          <a className="btn-quiet" href={`${MAIN_SITE}/manufacturing`} rel="noopener">Our manufacturing</a>
          <a className="btn-quiet" href={`${MAIN_SITE}/our-history`} rel="noopener">Our history</a>
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebSite', url: SITE_URL, name: 'AVVVS Ayur Store',
        potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
      }} />
    </>
  );
}
