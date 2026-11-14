'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="wrap">
      <div className="empty" style={{ padding: '90px 0 120px' }}>
        <h1>The pharmacy didn’t answer in time</h1>
        <p className="muted">This is usually brief. Please try again; your cart is safe.</p>
        <div className="hero-actions"><button type="button" className="btn" onClick={reset}>Try again</button><Link className="btn-quiet" href="/">Store home</Link></div>
      </div>
    </div>
  );
}
