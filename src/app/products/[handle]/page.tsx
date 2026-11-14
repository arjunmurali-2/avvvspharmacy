import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, getRecommendations } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import { readMedicine } from '@/lib/medicine';
import { amount, stripHtml, titleCase } from '@/lib/format';
import { CONCERNS, CONTACT, abs, breadcrumbLd, formByType } from '@/lib/site';
import { FORM_GUIDE, medicineContent, medicineName } from '@/content/medicines';
import { concernProducts, concernsFor } from '@/lib/concerns';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';
import { ProductGrid } from '@/components/ProductTile';
import { BuyBox, Gallery, ProductTracker } from '@/components/ProductView';
import type { ProductCard } from '@/lib/shopify/types';
import { RecentlyViewed } from '@/components/HomeParts';
import { ChatIcon } from '@/components/Icons';

type Props = { params: Promise<{ handle: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).handle).catch(() => null);
  if (!p) return { title: 'Medicine not found' };
  const name = medicineName(p.handle, p.title);
  const form = formByType(p.productType)?.name;
  // the reviewed summary comes before Shopify's SEO text, which repeats the old wording
  const desc = medicineContent(p.handle)?.summary || p.seo.description || stripHtml(p.descriptionHtml).slice(0, 155) || `${name}${form ? ` (${form})` : ''}: an Ayurveda medicine from AVVVS, Kozhikode.`;
  const img = p.featuredImage;
  return {
    title: medicineContent(p.handle) ? `${name}${form ? ` · ${form}` : ''}` : p.seo.title || `${name}${form ? ` · ${form}` : ''}`,
    description: desc,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: { type: 'website', title: name, description: desc, url: `/products/${p.handle}`, images: img ? [{ url: img.url, width: img.width ?? undefined, height: img.height ?? undefined, alt: img.altText || name }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) notFound();

  const name = medicineName(p.handle, p.title);
  const form = formByType(p.productType);
  const med = readMedicine(p.metafields);
  const content = medicineContent(p.handle);
  const howTo = content?.use ?? FORM_GUIDE[p.productType?.toUpperCase()] ?? FORM_GUIDE.PROPRIETARY;
  const concerns = (await concernsFor({ handle: p.handle, tags: p.tags })).map((slug) => ({ slug, name: CONCERNS.find((x) => x.slug === slug)?.name ?? titleCase(slug.replace(/-/g, ' ')) }));
  const [related, sameForm] = await Promise.all([
    getRecommendations(p.id),
    p.productType ? safe(getProducts({ type: p.productType, inStock: true, first: 9, sort: 'featured' }), null) : Promise.resolve(null),
  ]);
  const more = (sameForm?.products ?? []).filter((x) => x.id !== p.id && !related.some((r) => r.id === x.id)).slice(0, 4);

  // sold out: in-stock medicines listed under the same concerns, same form first
  let alternatives: ProductCard[] = [];
  if (!p.availableForSale && concerns.length) {
    const pools = await Promise.all(concerns.map((c) => concernProducts(c.slug).catch(() => ({ products: [] as ProductCard[] }))));
    const score = new Map<string, { card: ProductCard; n: number }>();
    for (const pool of pools) for (const card of pool.products) {
      if (card.handle === p.handle || !card.availableForSale) continue;
      const cur = score.get(card.handle) ?? { card, n: 0 };
      cur.n += 1 + (card.productType === p.productType ? 0.5 : 0);
      score.set(card.handle, cur);
    }
    alternatives = [...score.values()].sort((a, b) => b.n - a.n).slice(0, 4).map((x) => x.card);
  }
  // AVVVS's reviewed content (content/medicines.ts) replaces the raw Shopify description
  const hasDescription = !content && stripHtml(p.descriptionHtml).length > 0;
  const v = p.variants.nodes[0];

  return (
    <div className="wrap">
      <div style={{ paddingTop: 22 }}>
        <Crumbs trail={[
          ...(form ? [{ name: form.name, href: `/shop/${form.slug}` }] : [{ name: 'Medicines', href: '/medicines' }]),
          { name },
        ]} />
      </div>

      <div className="pdp">
        <Gallery images={p.images.nodes} name={name} />

        <div className="buy" data-anim>
          <div className="buy-title">
            {form && <Link className="eyebrow" href={`/shop/${form.slug}`} style={{ textDecoration: 'none' }}>{form.name} · {form.note}</Link>}
            <h1>{name}</h1>
            {(med.malayalam || med.sanskrit || form?.ml) && (
              <p className="buy-names">
                {med.malayalam && <span lang="ml">{med.malayalam}</span>}
                {med.sanskrit && <span lang="sa">{med.sanskrit}</span>}
              </p>
            )}
          </div>

          <BuyBox product={p} hasAlternatives={alternatives.length > 0} />

          {med.rxRecommended && (
            <div className="caution" role="note">
              <b>Best taken on a doctor’s advice.</b>
              <p>AVVVS recommends a consultation before using this medicine. You can attach a prescription to your cart if you have one.</p>
              <a className="link" href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
            </div>
          )}

          {content && (
            <div className="about" data-anim>
              <p className="about-lede">{content.summary}</p>
              {content.uses.length > 0 ? (
                <>
                  <p className="eyebrow">Traditionally used for</p>
                  <ul className="uses">{content.uses.map((u) => <li key={u}>{u}</li>)}</ul>
                </>
              ) : (
                <p className="muted">For guidance on when this medicine is used, please <a href={CONTACT.clinic} rel="noopener">consult a doctor</a> or ask our pharmacist on <a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">WhatsApp</a>.</p>
              )}
            </div>
          )}

          <div className="info">
            <details open={!!content}>
              <summary>How to take it</summary>
              <div className="body"><p>{howTo}</p><p className="fine">Always follow the dose your physician gives you and the directions on the label.</p></div>
            </details>
            {hasDescription && (
              <details open>
                <summary>About this medicine</summary>
                <div className="body rte" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
              </details>
            )}
            {med.sections.map((s) => (
              <details key={s.key}>
                <summary>{s.label}</summary>
                <div className="body">{s.list && s.list.length > 1 ? <ul>{s.list.map((x) => <li key={x}>{x}</li>)}</ul> : <p style={{ whiteSpace: 'pre-line' }}>{s.value}</p>}</div>
              </details>
            ))}
            <details>
              <summary>Product details</summary>
              <div className="body">
                <dl>
                  <dt>Form</dt><dd>{form?.name ?? titleCase(p.productType || '—')}</dd>
                  <dt>Made by</dt><dd>Arya Vaidya Vilasini Vaidya Sala, Kozhikode</dd>
                  {v?.sku ? <><dt>SKU</dt><dd>{v.sku}</dd></> : null}
                  {v?.weight ? <><dt>Shipping weight</dt><dd>{v.weight} {v.weightUnit.toLowerCase()}</dd></> : null}
                  {med.reference ? <><dt>Reference text</dt><dd>{med.reference}</dd></> : null}
                </dl>
              </div>
            </details>
            <details>
              <summary>Use with care</summary>
              <div className="body">
                <p>Ayurveda medicines are best taken under a qualified physician’s guidance. Read the label before use, follow the dose your doctor gives you, and keep medicines out of children’s reach. Tell your doctor if you are pregnant, breastfeeding or taking other medicines.</p>
                <p>Questions about this medicine? Call {CONTACT.phones[0]} or <a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">WhatsApp our pharmacy</a>.</p>
              </div>
            </details>
          </div>

          {concerns.length > 0 && (
            <div style={{ display: 'grid', gap: 10 }}>
              <p className="eyebrow">Listed under</p>
              <div className="tags">{concerns.map((c) => <Link key={c.slug} href={`/concerns/${c.slug}`}>{c.name}</Link>)}</div>
            </div>
          )}
        </div>
      </div>

      <aside className="assist section-deep" aria-labelledby="assist-h" data-anim>
        <span className="svc-ico"><ChatIcon /></span>
        <div>
          <h2 id="assist-h">Not sure this is the right medicine?</h2>
          <p>Ask our pharmacist about {name}, or consult an AVVVS doctor before you order.</p>
        </div>
        <div className="assist-actions">
          <a className="btn" href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">WhatsApp the pharmacy</a>
          <a className="btn-quiet" href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
        </div>
      </aside>

      {alternatives.length > 0 && (
        <section className="section" id="alternatives" aria-labelledby="alt-h" style={{ paddingTop: 0 }}>
          <div className="section-head" data-anim>
            <div>
              <p className="eyebrow">In stock now</p>
              <h2 id="alt-h">For similar traditional uses</h2>
            </div>
            <p className="fine" style={{ maxWidth: '30rem' }}>These are listed under the same concerns as {name}. They are not substitutes: please ask your doctor or our pharmacist before switching medicines.</p>
          </div>
          <ProductGrid products={alternatives} className="grid grid-4" />
        </section>
      )}

      {related.length > 0 && (
        <section className="section" aria-labelledby="rel-h" style={{ paddingTop: 0 }}>
          <div className="section-head" data-anim><div><p className="eyebrow">Related</p><h2 id="rel-h">Often viewed with {name}</h2></div></div>
          <ProductGrid products={related.slice(0, 4)} className="grid grid-4" />
        </section>
      )}
      {more.length > 0 && form && (
        <section className="section" aria-labelledby="more-h" style={{ paddingTop: 0 }}>
          <div className="section-head" data-anim>
            <div><p className="eyebrow">{form.note}</p><h2 id="more-h">More {form.name.toLowerCase()}</h2></div>
            <Link className="link" href={`/shop/${form.slug}`}>See all →</Link>
          </div>
          <ProductGrid products={more} className="grid grid-4" />
        </section>
      )}
      <RecentlyViewed skip={p.handle} />

      <ProductTracker product={p} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name, sku: v?.sku || undefined,
        image: p.images.nodes.map((i) => i.url), description: content?.summary || stripHtml(p.descriptionHtml) || undefined,
        brand: { '@type': 'Brand', name: 'AVVVS' }, category: form?.name,
        manufacturer: { '@type': 'Organization', name: 'Arya Vaidya Vilasini Vaidya Sala' },
        offers: {
          '@type': 'Offer', url: abs(`/products/${p.handle}`), priceCurrency: p.priceRange.minVariantPrice.currencyCode,
          price: amount(p.priceRange.minVariantPrice).toFixed(2),
          availability: p.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'AVVVS' },
        },
      }} />
      <JsonLd data={breadcrumbLd([...(form ? [{ name: form.name, path: `/shop/${form.slug}` }] : []), { name, path: `/products/${p.handle}` }])} />
    </div>
  );
}
