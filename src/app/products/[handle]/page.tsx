import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, getRecommendations } from '@/lib/shopify/catalog';
import { safe } from '@/lib/shopify/client';
import { readMedicine } from '@/lib/medicine';
import { amount, stripHtml, titleCase } from '@/lib/format';
import { CONCERNS, CONCERN_PREFIX, CONTACT, abs, breadcrumbLd, formByType } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';
import { JsonLd } from '@/components/JsonLd';
import { ProductGrid } from '@/components/ProductTile';
import { BuyBox, Gallery, ProductTracker } from '@/components/ProductView';
import { RecentlyViewed } from '@/components/HomeParts';

type Props = { params: Promise<{ handle: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).handle).catch(() => null);
  if (!p) return { title: 'Medicine not found' };
  const name = titleCase(p.title);
  const form = formByType(p.productType)?.name;
  const desc = p.seo.description || stripHtml(p.descriptionHtml).slice(0, 155) || `${name}${form ? ` (${form})` : ''}: an Ayurveda medicine from AVVVS, Kozhikode.`;
  const img = p.featuredImage;
  return {
    title: p.seo.title || `${name}${form ? ` · ${form}` : ''}`,
    description: desc,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: { type: 'website', title: name, description: desc, url: `/products/${p.handle}`, images: img ? [{ url: img.url, width: img.width ?? undefined, height: img.height ?? undefined, alt: img.altText || name }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) notFound();

  const name = titleCase(p.title);
  const form = formByType(p.productType);
  const med = readMedicine(p.metafields);
  const concerns = p.collections.nodes.filter((c) => c.handle.startsWith(CONCERN_PREFIX)).map((c) => {
    const slug = c.handle.slice(CONCERN_PREFIX.length);
    return { slug, name: CONCERNS.find((x) => x.slug === slug)?.name ?? titleCase(c.title) };
  });
  const [related, sameForm] = await Promise.all([
    getRecommendations(p.id),
    p.productType ? safe(getProducts({ type: p.productType, inStock: true, first: 9, sort: 'featured' }), null) : Promise.resolve(null),
  ]);
  const more = (sameForm?.products ?? []).filter((x) => x.id !== p.id && !related.some((r) => r.id === x.id)).slice(0, 4);
  const hasDescription = stripHtml(p.descriptionHtml).length > 0;
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

          <BuyBox product={p} />

          {med.rxRecommended && (
            <div className="caution" role="note">
              <b>Best taken on a doctor’s advice.</b>
              <p>AVVVS recommends a consultation before using this medicine. You can attach a prescription to your cart if you have one.</p>
              <a className="link" href={CONTACT.clinic} rel="noopener">Consult a doctor ↗</a>
            </div>
          )}

          <div className="info">
            {hasDescription && (
              <details open>
                <summary>About this medicine</summary>
                <div className="body rte" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
              </details>
            )}
            {med.sections.map((s, i) => (
              <details key={s.key} open={!hasDescription && i === 0}>
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
        image: p.images.nodes.map((i) => i.url), description: stripHtml(p.descriptionHtml) || undefined,
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
