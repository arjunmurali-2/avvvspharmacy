'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getRecsFor } from '@/app/cart/recs';
import type { ProductCard } from '@/lib/shopify/types';
import { CONTACT } from '@/lib/site';
import { CartExtras, CartLines, CheckoutButton, EmptyCart, PrescriptionUpload, Totals } from './Cart';
import { ProductGrid } from './ProductTile';
import { useStore } from './StoreProvider';

export function CartPageView() {
  const { cart, ready, signedIn } = useStore();
  const [recs, setRecs] = useState<ProductCard[]>([]);
  const firstId = cart?.lines.nodes[0]?.merchandise.product.handle;
  useEffect(() => { if (firstId) getRecsFor(firstId).then(setRecs); }, [firstId]);

  if (!ready) return <div className="skeleton" style={{ height: 240, marginBottom: 90 }} />;
  if (!cart || !cart.totalQuantity) return <div style={{ paddingBottom: 90 }}><EmptyCart /></div>;

  const inCart = new Set(cart.lines.nodes.map((l) => l.merchandise.product.handle));
  const suggestions = recs.filter((r) => !inCart.has(r.handle)).slice(0, 4);

  return (
    <>
      <div className="listing cart-layout">
        <div style={{ display: 'grid', gap: 26, alignContent: 'start' }}>
          <CartLines cart={cart} />
          <PrescriptionUpload cart={cart} />
        </div>
        <aside className="panel cart-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <CartExtras cart={cart} />
          <Totals cart={cart} />
          <CheckoutButton cart={cart} />
          {!signedIn && <p className="fine"><Link href="/account/login?next=/cart" prefetch={false}>Sign in</Link> to see past orders and reorder in one click. You can also check out as a guest.</p>}
          <p className="fine">Questions before you order? <a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">WhatsApp the pharmacy</a> or call {CONTACT.phones[0]}.</p>
        </aside>
      </div>
      {suggestions.length > 0 && (
        <section className="section" aria-labelledby="recs-h" style={{ paddingTop: 0 }}>
          <div className="section-head"><div><p className="eyebrow">You may also need</p><h2 id="recs-h">Often bought together</h2></div></div>
          <ProductGrid products={suggestions} className="grid grid-4" />
        </section>
      )}
    </>
  );
}
