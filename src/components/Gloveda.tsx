import { CONTACT } from '@/lib/site';

/**
 * A banner for Gloveda Herbals, the cosmetics and skincare side of AVVVS, which has its own site.
 * Shown on the home page, the Cosmetics & care collection and the Skin & hair concern.
 */
export function GlovedaBanner({ id = 'gloveda-h' }: { id?: string }) {
  return (
    <aside className="gloveda" aria-labelledby={id} data-anim>
      <div>
        <h2 id={id}>Gloveda Herbals</h2>
        <p className="lead">The cosmetics and skincare side of AVVVS: herbal care for skin and hair, on its own site.</p>
      </div>
      <a className="btn-quiet" href={CONTACT.gloveda} rel="noopener">Visit Gloveda Herbals</a>
    </aside>
  );
}
