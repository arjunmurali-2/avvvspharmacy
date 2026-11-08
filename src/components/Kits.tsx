'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ProductCard } from '@/lib/shopify/types';
import { money } from '@/lib/format';
import { medicineName } from '@/content/medicines';
import { itemOf } from './ProductTile';
import { useStore } from './StoreProvider';

type KitView = { handle: string; title: string; description: string; products: ProductCard[] };

/** Adds every in-stock medicine of a kit to the cart in one go. */
export function AddKit({ products, label = 'Add the kit to cart' }: { products: ProductCard[]; label?: string }) {
  const { add, openDrawer, toast } = useStore();
  const [busy, setBusy] = useState(false);
  const inStock = products.filter((p) => p.availableForSale && p.variants.nodes[0]);
  const skipped = products.length - inStock.length;
  if (!inStock.length) return <p className="fine">This kit is out of stock at the moment.</p>;
  return (
    <button type="button" className="btn" disabled={busy} onClick={async () => {
      setBusy(true);
      for (const p of inStock) await add(p.variants.nodes[0].id, 1, itemOf(p), { silent: true });
      setBusy(false);
      openDrawer();
      if (skipped) toast({ text: `${skipped} item${skipped === 1 ? ' is' : 's are'} out of stock and ${skipped === 1 ? 'was' : 'were'} left out.` });
    }}>
      {busy ? 'Adding…' : label} <span className="arr" aria-hidden="true">→</span>
    </button>
  );
}

export function KitCard({ kit }: { kit: KitView }) {
  const total = kit.products.filter((p) => p.availableForSale).reduce((s, p) => s + Number(p.priceRange.minVariantPrice.amount), 0);
  const cur = kit.products[0]?.priceRange.minVariantPrice.currencyCode ?? 'INR';
  return (
    <article className="kit" data-anim>
      <div className="kit-shots" aria-hidden="true">
        {kit.products.slice(0, 4).map((p) => (
          <span key={p.id}>{p.featuredImage && <Image src={p.featuredImage.url} alt="" fill sizes="120px" />}</span>
        ))}
      </div>
      <div className="kit-body">
        <p className="eyebrow">Care kit · {kit.products.length} medicines</p>
        <h3><Link href={`/collections/${kit.handle}`}>{kit.title}</Link></h3>
        {kit.description && <p className="muted">{kit.description}</p>}
        <ul className="kit-list">
          {kit.products.map((p) => (
            <li key={p.id} className={p.availableForSale ? undefined : 'is-out'}>
              <Link href={`/products/${p.handle}`}>{medicineName(p.handle, p.title)}</Link>
              <span>{p.availableForSale ? money(p.priceRange.minVariantPrice, { compact: true }) : 'out of stock'}</span>
            </li>
          ))}
        </ul>
        <div className="kit-foot">
          <span className="fine">Together {money({ amount: String(total), currencyCode: cur }, { compact: true })}</span>
          <AddKit products={kit.products} />
        </div>
      </div>
    </article>
  );
}
