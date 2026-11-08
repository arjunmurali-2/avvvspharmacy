'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useCards } from './HomeParts';
import { ProductGrid, itemOf } from './ProductTile';
import { useStore } from './StoreProvider';

export function WishlistView() {
  const { wishlist, add, signedIn } = useStore();
  const cards = useCards(wishlist);
  const [pending, start] = useTransition();

  if (cards === null) return <div className="skeleton" style={{ height: 260 }} />;
  // keep the saved order, and drop anything Shopify no longer sells
  const list = wishlist.map((h) => cards.find((c) => c.handle === h)).filter(Boolean) as typeof cards;
  if (!list.length) {
    return (
      <div className="empty">
        <h3>Nothing saved yet</h3>
        <p className="muted">Tap the heart on any medicine to keep it here.</p>
        <Link className="btn" href="/medicines">Browse medicines</Link>
        {!signedIn && <Link className="link" href="/account/login?next=/wishlist" prefetch={false}>Sign in to bring back a saved list</Link>}
      </div>
    );
  }
  const available = list.filter((p) => p.availableForSale && p.variants.nodes[0]);
  return (
    <>
      <div className="toolbar">
        <p className="count">{list.length} saved</p>
        {available.length > 0 && (
          <button type="button" className="btn btn-sm" disabled={pending} onClick={() => start(async () => {
            for (const p of available) await add(p.variants.nodes[0].id, 1, itemOf(p), { silent: true });
          })}>{pending ? 'Adding…' : `Add all ${available.length} in stock to cart`}</button>
        )}
      </div>
      <ProductGrid products={list} />
    </>
  );
}
