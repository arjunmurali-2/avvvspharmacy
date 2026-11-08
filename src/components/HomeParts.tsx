'use client';

import { useEffect, useState } from 'react';
import { cardsFor } from '@/app/actions';
import type { ProductCard } from '@/lib/shopify/types';
import { SearchIcon } from './Icons';
import { ProductGrid } from './ProductTile';
import { useStore } from './StoreProvider';

export const SEARCH_EVENT = 'avvvs:search-open';
export const openSearch = () => window.dispatchEvent(new Event(SEARCH_EVENT));

export function HeroSearch() {
  return (
    <button type="button" className="hero-search" onClick={openSearch} aria-label="Search medicines">
      <SearchIcon /><span>Search medicines by name</span><span className="btn" aria-hidden="true">Search</span>
    </button>
  );
}

/** Cards for a list of handles, fetched in the browser (recently viewed, wishlist). */
export function useCards(handles: string[], skip?: string) {
  const [cards, setCards] = useState<ProductCard[] | null>(null);
  const key = handles.filter((h) => h !== skip).join(',');
  useEffect(() => {
    if (!key) { setCards([]); return; }
    let live = true;
    cardsFor(key.split(',')).then((c) => { if (live) setCards(c); });
    return () => { live = false; };
  }, [key]);
  return cards;
}

export function RecentlyViewed({ skip, title = 'Recently viewed' }: { skip?: string; title?: string }) {
  const { recent } = useStore();
  const cards = useCards(recent.slice(0, 9), skip);
  if (!cards?.length) return null;
  return (
    <section className="section wrap" aria-labelledby="recent-h" style={{ paddingTop: 0 }}>
      <div className="section-head" data-anim><div><p className="eyebrow">Pick up where you left off</p><h2 id="recent-h">{title}</h2></div></div>
      <ProductGrid products={cards.slice(0, 4)} className="grid grid-4" />
    </section>
  );
}
