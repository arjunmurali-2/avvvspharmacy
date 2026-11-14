'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ProductCard } from '@/lib/shopify/types';
import { amount, money, titleCase } from '@/lib/format';
import { formByType } from '@/lib/site';
import { HeartIcon } from './Icons';
import { medicineName } from '@/content/medicines';
import { useStore } from './StoreProvider';
import { fitted } from '@/lib/shopify/image';

export const itemOf = (p: Pick<ProductCard, 'title' | 'productType' | 'priceRange' | 'handle'> & { variants?: ProductCard['variants']; id: string }) => ({
  id: p.variants?.nodes[0]?.id ?? p.id,
  name: medicineName(p.handle, p.title),
  price: amount(p.priceRange.minVariantPrice),
  category: formByType(p.productType)?.name ?? p.productType,
});

export function WishButton({ product, inline }: { product: ProductCard; inline?: boolean }) {
  const { wishlist, toggleWish } = useStore();
  const on = wishlist.includes(product.handle);
  const name = medicineName(product.handle, product.title);
  return (
    <button type="button" className={`wish${inline ? ' wish-inline' : ''}`} aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      onClick={() => toggleWish(product.handle, itemOf(product))}>
      <HeartIcon />
    </button>
  );
}

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
const BellIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;

/** A round "+" on the photograph that opens into "Add to cart" on hover, and confirms with a tick. */
export function QuickAdd({ product }: { product: ProductCard }) {
  const { add } = useStore();
  const [state, setState] = useState<'idle' | 'adding' | 'done'>('idle');
  const v = product.variants.nodes[0];
  const name = medicineName(product.handle, product.title);
  if (!v || !product.availableForSale) {
    return <Link className="tile-add is-notify" href={`/products/${product.handle}#notify`} aria-label={`Notify me when ${name} is back`}><BellIcon /><span>Notify me</span></Link>;
  }
  return (
    <button type="button" className={`tile-add${state === 'done' ? ' is-done' : ''}`} disabled={state === 'adding'} aria-label={`Add ${name} to cart`}
      onClick={async () => {
        setState('adding');
        const ok = await add(v.id, 1, itemOf(product));
        setState(ok ? 'done' : 'idle');
        if (ok) window.setTimeout(() => setState('idle'), 1600);
      }}>
      {state === 'done' ? <CheckIcon /> : <PlusIcon />}
      <span>{state === 'adding' ? 'Adding…' : state === 'done' ? 'Added' : 'Add to cart'}</span>
    </button>
  );
}

export function ProductTile({ product, priority }: { product: ProductCard; priority?: boolean }) {
  const form = formByType(product.productType);
  const price = product.priceRange.minVariantPrice;
  const was = product.compareAtPriceRange.minVariantPrice;
  const onSale = amount(was) > amount(price);
  const name = medicineName(product.handle, product.title);
  return (
    <article className={`tile${product.availableForSale ? '' : ' is-out'}`}>
      <Link href={`/products/${product.handle}`} className="tile-link" prefetch={false}>
        <div className="tile-media">
          {product.featuredImage ? (
            <Image src={fitted(product.featuredImage.url)} alt={product.featuredImage.altText || name} fill
              sizes="(max-width: 680px) 46vw, (max-width: 1100px) 30vw, 280px" priority={priority} />
          ) : <span className="tile-noimg" aria-hidden="true">{name.charAt(0)}</span>}
        </div>
        <div className="tile-info">
          <span className="tile-form">{form?.name ?? titleCase(product.productType || 'Ayurveda')}</span>
          <div className="tile-row">
            <h3 className="tile-name">{name}</h3>
            <p className="tile-price">
              <span>{money(price, { compact: true })}</span>
              {onSale && <s aria-label={`was ${money(was, { compact: true })}`}>{money(was, { compact: true })}</s>}
            </p>
          </div>
        </div>
      </Link>
      <div className="tile-over">
        {!product.availableForSale && <span className="tile-flag">Out of stock</span>}
        {product.availableForSale && onSale && <span className="tile-flag tile-flag-sale">Offer</span>}
        <WishButton product={product} />
        <QuickAdd product={product} />
      </div>
    </article>
  );
}

export function ProductGrid({ products, className = 'grid', priority = 0 }: { products: ProductCard[]; className?: string; priority?: number }) {
  return (
    <ul className={className} data-anim="stagger">
      {products.map((p, i) => <li key={p.id}><ProductTile product={p} priority={i < priority} /></li>)}
    </ul>
  );
}
