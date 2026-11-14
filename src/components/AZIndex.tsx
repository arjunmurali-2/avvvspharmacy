'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Money } from '@/lib/shopify/types';
import { indexLetter, loose, money, titleCase } from '@/lib/format';
import { FORMS, formByType } from '@/lib/site';
import { medicineName } from '@/content/medicines';

type Row = { handle: string; title: string; type: string; available: boolean; price: Money };
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');


export function AZIndex({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState('');
  const [form, setForm] = useState('');
  const [stock, setStock] = useState(false);

  const groups = useMemo(() => {
    const lq = loose(q);
    const list = rows
      .filter((r) => !form || r.type === form)
      .filter((r) => !stock || r.available)
      .map((r) => ({ ...r, title: medicineName(r.handle, r.title) }))
      .filter((r) => !lq || loose(r.title).includes(lq))
      .sort((a, b) => a.title.localeCompare(b.title));
    const m = new Map<string, Row[]>();
    for (const r of list) { const l = indexLetter(r.title); m.set(l, [...(m.get(l) ?? []), r]); }
    return m;
  }, [rows, q, form, stock]);

  const count = [...groups.values()].reduce((s, g) => s + g.length, 0);

  return (
    <>
      <div className="az-tools">
        <label className="sr-only" htmlFor="az-q">Filter medicines by name</label>
        <input id="az-q" className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type part of a name…" autoComplete="off" />
        <label className="sr-only" htmlFor="az-form">Form</label>
        <select id="az-form" className="select" style={{ width: 'auto', minHeight: 42 }} value={form} onChange={(e) => setForm(e.target.value)}>
          <option value="">All forms</option>
          {FORMS.map((f) => <option key={f.type} value={f.type}>{f.name}</option>)}
        </select>
        <label className="check"><input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />In stock only</label>
        <span className="muted" aria-live="polite">{count} shown</span>
      </div>
      <nav className="az-jump" aria-label="Jump to letter">
        {LETTERS.map((l) => (groups.has(l) ? <a key={l} href={`#az-${l}`}>{l}</a> : <span key={l} aria-hidden="true">{l}</span>))}
      </nav>
      <div className="az">
        {[...groups.entries()].map(([letter, list]) => (
          <section key={letter} id={`az-${letter}`} aria-labelledby={`azh-${letter}`}>
            <h2 id={`azh-${letter}`}>{letter}</h2>
            <ul>
              {list.map((r) => (
                <li key={r.handle} className={r.available ? undefined : 'is-out'}>
                  <Link href={`/products/${r.handle}`} prefetch={false}>{r.title}</Link>
                  <small>{formByType(r.type)?.name ?? titleCase(r.type)}, {r.available ? money(r.price, { compact: true }) : 'out of stock'}</small>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!count && <div className="empty"><h3>No medicine matches</h3><p className="muted">Try fewer letters; spellings vary.</p></div>}
      </div>
    </>
  );
}
