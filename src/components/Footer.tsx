import Link from 'next/link';
import { AvvvsLockup } from './Logo';
import { CookieSettingsLink } from './CookieConsent';
import { COLLECTIONS, CONCERNS, CONTACT, HELP_PAGES, LEGAL_PAGES, MAIN_SITE, ORG } from '@/lib/site';

export function Footer() {
  return (
    <footer className="foot">
      <span className="foot-thread" aria-hidden="true" />
      <div className="foot-grid" data-anim="stagger">
        <div className="foot-brand">
          <AvvvsLockup height={52} className="foot-lockup" />
          <p className="ml" lang="ml">{ORG.malayalam}</p>
          <p className="muted">Ayurveda medicines from our own GMP-certified factory in Kozhikode, since {ORG.founded}.</p>
        </div>
        <nav className="foot-col" aria-label="Shop">
          <h2 className="foot-h">Shop</h2>
          <ul>
            <li><Link href="/medicines">Medicines A–Z</Link></li>
            {COLLECTIONS.map((c) => <li key={c.handle}><Link href={`/collections/${c.handle}`}>{c.name}</Link></li>)}
            <li><Link href="/concerns">Shop by concern</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
          </ul>
        </nav>
        <nav className="foot-col" aria-label="Concerns">
          <h2 className="foot-h">Concerns</h2>
          <ul>{CONCERNS.slice(0, 7).map((c) => <li key={c.slug}><Link href={`/concerns/${c.slug}`}>{c.name}</Link></li>)}</ul>
        </nav>
        <nav className="foot-col" aria-label="Help">
          <h2 className="foot-h">Help</h2>
          <ul>
            <li><Link href="/account" prefetch={false}>Your account &amp; orders</Link></li>
            {HELP_PAGES.map((p) => <li key={p.handle}><Link href={`/pages/${p.handle}`}>{p.label}</Link></li>)}
            <li><a href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">WhatsApp us ↗</a></li>
          </ul>
        </nav>
        <div className="foot-col">
          <h2 className="foot-h">AVVVS</h2>
          <ul>
            <li><a href={CONTACT.clinic} rel="noopener">Ayur Clinic: consult a doctor ↗</a></li>
            <li><a href={`${MAIN_SITE}/manufacturing`} rel="noopener">Our manufacturing ↗</a></li>
            <li><a href={`${MAIN_SITE}/our-history`} rel="noopener">Our history ↗</a></li>
            <li><a href={MAIN_SITE} rel="noopener">avvvs.com ↗</a></li>
          </ul>
          <address style={{ marginTop: 16 }}>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            {CONTACT.phones.map((p) => <a key={p} href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>)}
          </address>
        </div>
      </div>
      <div className="foot-note">
        <p>Ayurveda medicines work best under a qualified physician’s guidance. Information on this store is not a substitute for medical advice; read the label before use and keep medicines out of children’s reach.</p>
      </div>
      <div className="foot-base">
        <p>© {new Date().getFullYear()} {ORG.name}</p>
        <ul aria-label="Legal">
          {LEGAL_PAGES.map((p) => <li key={p.handle}><Link href={`/pages/${p.handle}`}>{p.label}</Link></li>)}
          <li><CookieSettingsLink /></li>
        </ul>
        <ul aria-label="AVVVS elsewhere">{CONTACT.social.map((s) => <li key={s.label}><a href={s.href} rel="noopener">{s.label}</a></li>)}</ul>
      </div>
    </footer>
  );
}
