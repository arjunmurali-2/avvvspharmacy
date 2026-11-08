import type { Metadata } from 'next';
import { CartPageView } from '@/components/CartPage';
import { Crumbs } from '@/components/Crumbs';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Cart' }]} />
        <h1>Your cart</h1>
      </header>
      <CartPageView />
    </div>
  );
}
