import Image from 'next/image';
import Link from 'next/link';
import { getCollectionPage, getProducts } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import type { ProductPage } from '@/lib/shopify/types';
import { COLLECTIONS, CONCERNS, CONTACT, FORMS, MAIN_SITE, ORG } from '@/lib/site';
import { titleCase } from '@/lib/format';
import { ProductGrid } from '@/components/ProductTile';
import { HeroSearch, RecentlyViewed } from '@/components/HomeParts';
import { JsonLd } from '@/components/JsonLd';
import { SplitTitle } from '@/components/Motion';
import { ChatIcon, ClockIcon, DoctorIcon, LeafIcon, RxIcon, SearchIcon, ShieldIcon } from '@/components/Icons';
import { SITE_URL } from '@/lib/site';

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
          <div className="hero-copy">
            <p className="eyebrow" data-anim="fade">AVVVS Ayur Store · Kozhikode, since {ORG.founded}</p>
            <SplitTitle text="Ayurveda medicines, from our pharmacy to your door." />
            <p className="hero-ml ml" lang="ml" data-anim data-delay="250">{ORG.malayalam}</p>
            <p className="hero-lede" data-anim data-delay="350">Classical and proprietary formulations made in our own GMP-certified factory in Kerala. Find a medicine by name, by form, or by concern.</p>
            <HeroSearch />
            <p className="hero-try" data-anim data-delay="400">
              <span>Or search by what you feel:</span>
              {TRY.map((t) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}>{t}</Link>)}
            </p>
            <div className="hero-actions" data-anim data-delay="450">
              <Link className="btn" href="/medicines">Browse medicines A–Z <span className="arr" aria-hidden="true">→</span></Link>
              <a className="btn-quiet" href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
            </div>
          </div>
          {heroShots.length > 0 && (
            <div className="hero-art" aria-label="From the pharmacy" data-anim="stagger">
              {heroShots.map((p, i) => (
                <Link key={p.id} href={`/products/${p.handle}`} aria-label={titleCase(p.title)}>
                  <Image src={p.featuredImage!.url} alt={p.featuredImage!.altText || titleCase(p.title)} fill sizes="(max-width: 900px) 30vw, 240px" priority={i < 2} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <span className="hero-thread" aria-hidden="true" data-anim="line" />
      </section>

      <div className="wrap">
        <ul className="services" data-anim="stagger" aria-label="Pharmacy services">
          <li><Link href="/cart"><span className="svc-ico"><RxIcon /></span><b>Upload a prescription</b><span>Attach it to your order for our pharmacist</span><i className="go" aria-hidden="true">→</i></Link></li>
          <li><a href={CONTACT.clinic} rel="noopener"><span className="svc-ico"><DoctorIcon /></span><b>Consult a doctor</b><span>At the AVVVS Ayur Speciality Clinic</span><i className="go" aria-hidden="true">↗</i></a></li>
          <li><a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener"><span className="svc-ico"><ChatIcon /></span><b>Order on WhatsApp</b><span>Send your list to the pharmacy</span><i className="go" aria-hidden="true">↗</i></a></li>
          <li><Link href="/concerns"><span className="svc-ico"><SearchIcon /></span><b>Shop by concern</b><span>Twelve departments of care</span><i className="go" aria-hidden="true">→</i></Link></li>
        </ul>
        <ul className="trust" data-anim="stagger">
          <li><ClockIcon /><div><b>Since {ORG.founded}</b><span>Three generations of Ayurveda in Kozhikode</span></div></li>
          <li><LeafIcon /><div><b>Made by AVVVS</b><span>In our own GMP-certified factory</span></div></li>
          <li><ShieldIcon /><div><b>Secure checkout</b><span>Payments handled by Shopify</span></div></li>
          <li><ChatIcon /><div><b>Pharmacist help</b><span>Call or WhatsApp {CONTACT.phones[0]}</span></div></li>
        </ul>
      </div>

      <section className="section wrap" aria-labelledby="forms-h">
        <div className="section-head" data-anim>
          <div><p className="eyebrow">Shop by form</p><h2 id="forms-h">The Ayurveda pharmacy, by preparation</h2></div>
          <Link className="link" href="/medicines">Every medicine, A–Z →</Link>
        </div>
        <ol className="forms" data-anim="stagger">
          {FORMS.map((f, i) => (
            <li key={f.slug}>
              <Link href={`/shop/${f.slug}`}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <b>{f.name}</b>
                {f.ml && <span className="ml" lang="ml">{f.ml}</span>}
                <span>{f.note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {popular.products.length > 0 && (
        <section className="section wrap" aria-labelledby="pop-h" style={{ paddingTop: 0 }}>
          <div className="section-head" data-anim>
            <div><p className="eyebrow">In stock now</p><h2 id="pop-h">Most ordered</h2></div>
            <Link className="link" href="/shop/kashayam">All kashayams →</Link>
          </div>
          <ProductGrid products={popular.products} className="grid grid-4" />
        </section>
      )}

      <section className="section section-band" aria-labelledby="concern-h">
        <div className="wrap">
          <div className="section-head" data-anim>
            <div><p className="eyebrow">Shop by concern</p><h2 id="concern-h">Find care by department</h2></div>
            <p>Medicines grouped by AVVVS’s pharmacists the way a hospital groups its departments. For anything ongoing, please consult a doctor first.</p>
          </div>
          <ol className="concerns" data-anim="stagger">
            {CONCERNS.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/concerns/${c.slug}`}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <b>{c.name}</b>
                  <span className="go" aria-hidden="true">→</span>
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
            <div><p className="eyebrow">Classical medicines</p><h2 id="classical-h">From the classical texts</h2></div>
            <Link className="link" href="/collections/classical">See all classical →</Link>
          </div>
          <ProductGrid products={classical.products} className="grid grid-4" />
        </section>
      )}

      <section className="section wrap" aria-labelledby="coll-h" style={{ paddingTop: 0 }}>
        <div className="section-head" data-anim><div><p className="eyebrow">Collections</p><h2 id="coll-h">Browse the range</h2></div></div>
        <ul className="colls" data-anim="stagger">
          {COLLECTIONS.map((c) => <li key={c.handle}><Link href={`/collections/${c.handle}`}><b>{c.name}</b><span>{c.note}</span></Link></li>)}
        </ul>
      </section>

      {proprietary.products.length > 0 && (
        <section className="section wrap" aria-labelledby="prop-h" style={{ paddingTop: 0 }}>
          <div className="section-head" data-anim>
            <div><p className="eyebrow">Proprietary</p><h2 id="prop-h">AVVVS formulations</h2></div>
            <Link className="link" href="/collections/proprietary">See all →</Link>
          </div>
          <ProductGrid products={proprietary.products} className="grid grid-4" />
        </section>
      )}

      <RecentlyViewed />

      <section className="section section-deep" aria-labelledby="consult-h">
        <div className="wrap consult">
          <div className="consult-copy" data-anim>
            <p className="eyebrow">AVVVS Ayur Speciality Clinic</p>
            <h2 id="consult-h">Not sure which medicine is right for you?</h2>
            <p className="head-lede">Ayurveda treats the person, not only the complaint. Our doctors can advise on medicines, dosage and diet before you order.</p>
            <a className="btn" href={CONTACT.clinic} rel="noopener">Consult a doctor <span className="arr" aria-hidden="true">↗</span></a>
          </div>
          <ol className="consult-steps" data-anim="stagger">
            <li><b>01</b><span>Book a consultation at the AVVVS Ayur Speciality Clinic.</span></li>
            <li><b>02</b><span>Your doctor prescribes medicines, dosage and anupana.</span></li>
            <li><b>03</b><span>Order here, and attach the prescription to your cart for our pharmacist.</span></li>
          </ol>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="made-h">
        <div className="section-head" data-anim>
          <div><p className="eyebrow">Made by AVVVS</p><h2 id="made-h">From our own factory, since {ORG.founded}</h2></div>
          <p>Every medicine here is prepared by Arya Vaidya Vilasini Vaidya Sala in Kozhikode, Kerala. See how they are made.</p>
        </div>
        <div className="hero-actions">
          <a className="btn-quiet" href={`${MAIN_SITE}/manufacturing`} rel="noopener">Our manufacturing ↗</a>
          <a className="btn-quiet" href={`${MAIN_SITE}/our-history`} rel="noopener">Our history ↗</a>
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebSite', url: SITE_URL, name: 'AVVVS Ayur Store',
        potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
      }} />
    </>
  );
}
