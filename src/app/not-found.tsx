import Link from 'next/link';
import { HeroSearch } from '@/components/HomeParts';

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty" style={{ padding: '90px 0 120px' }}>
        <p className="eyebrow">Not found</p>
        <h1>We couldn’t find that page</h1>
        <p className="muted">The medicine may have moved or been renamed. Search for it, or find it in the A–Z list.</p>
        <HeroSearch />
        <div className="hero-actions"><Link className="btn" href="/medicines">Medicines A–Z</Link><Link className="btn-quiet" href="/">Store home</Link></div>
      </div>
    </div>
  );
}
