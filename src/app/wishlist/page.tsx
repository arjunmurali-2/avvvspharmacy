import type { Metadata } from 'next';
import { Crumbs } from '@/components/Crumbs';
import { WishlistView } from '@/components/WishlistView';

export const metadata: Metadata = { title: 'Your wishlist', robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="wrap" style={{ paddingBottom: 90 }}>
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Wishlist' }]} />
        <h1>Your wishlist</h1>
        <p className="head-lede">Medicines you have saved. Signed in, your list follows you to any device.</p>
      </header>
      <WishlistView />
    </div>
  );
}
