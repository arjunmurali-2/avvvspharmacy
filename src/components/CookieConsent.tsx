'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Ported from web/src/components/CookieConsent.tsx, with the same storage key and events.
export type Consent = { analytics: boolean; marketing: boolean; at: string };
type Choice = Omit<Consent, 'at'>;
const KEY = 'avvvs-consent';
export const CONSENT_EVENT = 'avvvs:consent';
const OPEN_EVENT = 'avvvs:consent-open';

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return null;
    const c = JSON.parse(v) as Partial<Consent>;
    return { analytics: !!c.analytics, marketing: !!c.marketing, at: c.at ?? '' };
  } catch { return null; }
}
function save(c: Choice) {
  const v: Consent = { ...c, at: new Date().toISOString() };
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: ask again next time */ }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: v }));
}

export function CookieSettingsLink({ label = 'Cookie settings' }: { label?: string }) {
  return <button type="button" className="link-btn" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>{label}</button>;
}

const ROWS: { k: keyof Choice; title: string; note: string }[] = [
  { k: 'analytics', title: 'Analytics', note: 'Google Analytics: which pages are visited and how the store is used.' },
  { k: 'marketing', title: 'Marketing', note: 'Meta Pixel: measures our ads on Facebook and Instagram.' },
];

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [choice, setChoice] = useState<Choice>({ analytics: false, marketing: false });

  useEffect(() => {
    const c = readConsent();
    if (!c) { const t = window.setTimeout(() => setOpen(true), 1500); return () => window.clearTimeout(t); }
    setChoice({ analytics: c.analytics, marketing: c.marketing });
  }, []);
  useEffect(() => {
    const reopen = () => { const c = readConsent(); setChoice({ analytics: !!c?.analytics, marketing: !!c?.marketing }); setDetails(true); setOpen(true); };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (c: Choice) => { save(c); setChoice(c); setOpen(false); setDetails(false); };
  if (!open) return null;

  return (
    <section className="cc" role="dialog" aria-modal="false" aria-labelledby="cc-title" aria-describedby="cc-desc">
      <span className="cc-thread" aria-hidden="true" />
      <h2 id="cc-title" className="cc-title">Your cookie choices</h2>
      <p id="cc-desc" className="cc-text">
        Your cart and sign-in need essential cookies. Analytics and advertising cookies run only if you allow them.{' '}
        <Link href="/pages/privacy-policy">Privacy policy</Link>
      </p>
      {details && (
        <div className="cc-options">
          <label className="cc-row">
            <span><b>Essential</b><span>Your cart, sign-in and this choice. Always on.</span></span>
            <input type="checkbox" checked disabled aria-label="Essential cookies, always on" />
            <i className="cc-switch is-on" aria-hidden="true" />
          </label>
          {ROWS.map((r) => (
            <label key={r.k} className="cc-row">
              <span><b>{r.title}</b><span>{r.note}</span></span>
              <input type="checkbox" checked={choice[r.k]} onChange={(e) => setChoice((c) => ({ ...c, [r.k]: e.target.checked }))} />
              <i className={`cc-switch${choice[r.k] ? ' is-on' : ''}`} aria-hidden="true" />
            </label>
          ))}
        </div>
      )}
      <div className="cc-actions">
        {details ? (
          <>
            <button type="button" className="btn btn-sm" onClick={() => choose(choice)}>Save my choices</button>
            <button type="button" className="btn-quiet btn-sm" onClick={() => choose({ analytics: true, marketing: true })}>Allow all</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-sm" onClick={() => choose({ analytics: true, marketing: true })}>Allow all</button>
            <button type="button" className="btn-quiet btn-sm" onClick={() => choose({ analytics: false, marketing: false })}>Essential only</button>
            <button type="button" className="link" onClick={() => setDetails(true)}>Choose</button>
          </>
        )}
      </div>
    </section>
  );
}
