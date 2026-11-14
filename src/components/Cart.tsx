'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import * as A from '@/app/actions';
import type { Cart, CartLine } from '@/lib/shopify/types';
import { amount, money, titleCase } from '@/lib/format';
import { FREE_SHIPPING, formByType } from '@/lib/site';
import { checkoutTracking, trackBeginCheckout, trackViewCart, type Item } from '@/lib/track';
import { CloseIcon, RxIcon, UploadIcon } from './Icons';
import { useStore } from './StoreProvider';
import { medicineName } from '@/content/medicines';
import { fitted } from '@/lib/shopify/image';

const items = (cart: Cart): Item[] => cart.lines.nodes.map((l) => ({
  id: l.merchandise.id, name: medicineName(l.merchandise.product.handle, l.merchandise.product.title), price: amount(l.cost.amountPerQuantity), quantity: l.quantity,
  category: formByType(l.merchandise.product.productType)?.name,
}));

export function Qty({ value, onChange, max = 99, disabled, label, large }: { value: number; onChange: (n: number) => void; max?: number; disabled?: boolean; label: string; large?: boolean }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => { const n = Math.max(0, Math.min(max, Math.floor(Number(draft) || 0))); if (n !== value) onChange(n); else setDraft(String(value)); };
  return (
    <div className={`qty${large ? ' qty-lg' : ''}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={disabled || value <= 1} aria-label="One fewer">−</button>
      <input type="number" inputMode="numeric" min={1} max={max} value={draft} disabled={disabled} aria-label="Quantity"
        onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }} />
      <button type="button" onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="One more">+</button>
    </div>
  );
}

function Line({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { update, remove } = useStore();
  const [busy, setBusy] = useState(false);
  const p = line.merchandise;
  const name = medicineName(p.product.handle, p.product.title);
  const was = line.cost.compareAtAmountPerQuantity;
  const act = async (fn: () => Promise<void>) => { setBusy(true); await fn(); setBusy(false); };
  return (
    <li className={`line${busy ? ' is-busy' : ''}`}>
      <Link href={`/products/${p.product.handle}`} className="line-img" onClick={onNavigate} tabIndex={-1} aria-hidden="true">
        {p.image ? <Image src={fitted(p.image.url)} alt="" width={76} height={76} /> : null}
      </Link>
      <div>
        <Link href={`/products/${p.product.handle}`} className="line-title" onClick={onNavigate}>{name}</Link>
        <p className="line-meta">
          {formByType(p.product.productType)?.name ?? titleCase(p.product.productType)}
          {p.title !== 'Default Title' ? `, ${p.title}` : ''}, {money(line.cost.amountPerQuantity, { compact: true })} each
        </p>
        {!p.availableForSale && <p className="line-meta msg-error">No longer in stock. Remove it to check out.</p>}
        <div className="line-actions">
          <Qty value={line.quantity} label={`Quantity of ${name}`} disabled={busy} onChange={(n) => act(() => (n <= 0 ? remove(line.id) : update(line.id, n)))} />
          <button type="button" className="link-quiet link-btn" onClick={() => act(() => remove(line.id))}>Remove</button>
        </div>
      </div>
      <p className="line-price">
        {money(line.cost.totalAmount)}
        {was && amount(was) > amount(line.cost.amountPerQuantity) && <s>{money({ amount: String(amount(was) * line.quantity), currencyCode: was.currencyCode })}</s>}
      </p>
    </li>
  );
}

function ShippingBar({ cart }: { cart: Cart }) {
  if (!FREE_SHIPPING) return null;
  const sub = amount(cart.cost.subtotalAmount);
  const left = Math.max(0, FREE_SHIPPING - sub);
  const cur = cart.cost.subtotalAmount.currencyCode;
  return (
    <div className="ship-bar">
      <span>{left > 0 ? <>Add <b>{money({ amount: String(left), currencyCode: cur }, { compact: true })}</b> more for free delivery.</> : 'Your order ships free.'}</span>
      <span className="track" aria-hidden="true"><span style={{ width: `${Math.min(100, (sub / FREE_SHIPPING) * 100)}%` }} /></span>
    </div>
  );
}

function Discounts({ cart }: { cart: Cart }) {
  const { setCart, run } = useStore();
  const uid = useId();
  const [code, setCode] = useState('');
  const [pending, start] = useTransition();
  const [err, setErr] = useState('');
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    start(async () => {
      setErr('');
      // the message shows under the field, so no toast here
      const r = await A.applyDiscount(code);
      if (r.cart) setCart(r.cart);
      if (r.error) setErr(r.error); else setCode('');
    });
  };
  return (
    <div className="field">
      <form className="inline-form" onSubmit={apply}>
        <label className="sr-only" htmlFor={`${uid}-code`}>Discount code</label>
        <input id={`${uid}-code`} className="input" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(''); }} placeholder="Discount code" autoComplete="off" aria-invalid={!!err} aria-describedby={err ? `${uid}-err` : undefined} />
        <button type="submit" className="btn-quiet" disabled={pending || !code.trim()}>{pending ? 'Applying…' : 'Apply'}</button>
      </form>
      {err && <p id={`${uid}-err`} className="msg msg-error" role="alert">{err}</p>}
      {cart.discountCodes.filter((d) => d.applicable).length > 0 && (
        <div className="chips">
          {cart.discountCodes.filter((d) => d.applicable).map((d) => (
            <span key={d.code} className="chip">{d.code}<button type="button" aria-label={`Remove code ${d.code}`} onClick={() => start(async () => { await run(A.removeDiscount(d.code)); })}>×</button></span>
          ))}
        </div>
      )}
    </div>
  );
}

function Note({ cart }: { cart: Cart }) {
  const { run } = useStore();
  const uid = useId();
  const [open, setOpen] = useState(!!cart.note);
  const [note, setNote] = useState(cart.note ?? '');
  const [saved, setSaved] = useState(false);
  const save = async () => { if ((cart.note ?? '') === note) return; await run(A.saveNote(note)); setSaved(true); window.setTimeout(() => setSaved(false), 2000); };
  if (!open) return <button type="button" className="link link-btn" onClick={() => setOpen(true)}>Add a note for the pharmacy</button>;
  return (
    <div className="field">
      <label htmlFor={`${uid}-note`}>Note for the pharmacy</label>
      <textarea id={`${uid}-note`} className="textarea" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} onBlur={save}
        placeholder="Delivery instructions, or anything our pharmacist should know" />
      {saved && <p className="msg msg-ok" role="status">Note saved.</p>}
    </div>
  );
}

const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

/** Optional: a prescription or doctor's note travels with the order to AVVVS's pharmacist. */
export function PrescriptionUpload({ cart }: { cart: Cart }) {
  const { run } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [err, setErr] = useState('');
  const url = cart.attributes.find((a) => a.key === 'Prescription')?.value;
  const name = cart.attributes.find((a) => a.key === 'Prescription file')?.value || 'Prescription';

  const upload = async (f: File) => {
    setErr('');
    if (f.size > 10 * 1024 * 1024) { setState('error'); setErr('That file is larger than 10 MB. Please upload a smaller photo or PDF.'); return; }
    if (f.type && !ACCEPT.includes(f.type)) { setState('error'); setErr('Please upload a PDF or a photo (JPG, PNG or HEIC).'); return; }
    setState('uploading');
    const fd = new FormData();
    fd.append('file', f);
    const res = await fetch('/api/prescription', { method: 'POST', body: fd }).then((r) => r.json()).catch(() => ({ error: 'Upload failed. Please try again.' }));
    if (res.error) { setState('error'); setErr(res.error); return; }
    await run(A.attachPrescription({ url: res.url, name: f.name }));
    setState('idle');
  };

  return (
    <div className={`rx${drag ? ' is-drag' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}>
      <div className="rx-head">
        <RxIcon />
        <div>
          <h3>Prescription or doctor’s note <span className="muted">(optional)</span></h3>
          <p>Attach one if you have it, and our pharmacist will check your order against it.</p>
        </div>
      </div>
      {url ? (
        <div className="rx-file">
          <span aria-hidden="true">✓</span>
          <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
          <button type="button" className="link link-btn" onClick={() => run(A.attachPrescription(null))}>Remove</button>
        </div>
      ) : (
        <div className="rx-file">
          <input ref={file} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,image/*,application/pdf"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          <button type="button" className="btn-quiet btn-sm" onClick={() => file.current?.click()} disabled={state === 'uploading'}>
            <UploadIcon className="" />{state === 'uploading' ? 'Uploading…' : 'Choose a file'}
          </button>
          <span className="fine">PDF, JPG, PNG or HEIC, up to 10 MB</span>
        </div>
      )}
      {err && <p className="msg msg-error" role="alert">{err}</p>}
    </div>
  );
}

export function CheckoutButton({ cart }: { cart: Cart }) {
  const { toast } = useStore();
  const [pending, start] = useTransition();
  const blocked = cart.lines.nodes.some((l) => !l.merchandise.availableForSale);
  return (
    <button type="button" className="btn btn-wide" disabled={pending || blocked || !cart.totalQuantity}
      onClick={() => start(async () => {
        trackBeginCheckout(items(cart));
        const r = await A.prepareCheckout(checkoutTracking());
        if (r.url) window.location.href = r.url; else toast({ text: r.error ?? 'Checkout could not be started.', tone: 'error' });
      })}>
      {pending ? 'Opening secure checkout…' : 'Checkout securely'}
    </button>
  );
}

export function Totals({ cart }: { cart: Cart }) {
  const savings = cart.lines.nodes.reduce((s, l) => {
    const was = l.cost.compareAtAmountPerQuantity;
    return s + (was ? Math.max(0, amount(was) - amount(l.cost.amountPerQuantity)) * l.quantity : 0);
  }, 0) + Math.max(0, amount(cart.cost.subtotalAmount) - amount(cart.cost.totalAmount));
  const cur = cart.cost.totalAmount.currencyCode;
  return (
    <div className="totals">
      <div><span>Subtotal</span><span>{money(cart.cost.subtotalAmount)}</span></div>
      {savings > 0 && <div className="msg-ok"><span>You save</span><span>{money({ amount: String(savings), currencyCode: cur })}</span></div>}
      <div className="muted"><span>Delivery</span><span>At checkout</span></div>
      <div className="grand"><span>Total</span><span>{money(cart.cost.totalAmount)}</span></div>
      <p className="fine">Taxes, delivery and payment are settled at Shopify’s secure checkout.</p>
    </div>
  );
}

export function CartLines({ cart, onNavigate }: { cart: Cart; onNavigate?: () => void }) {
  return <ul className="lines" data-anim="stagger">{cart.lines.nodes.map((l) => <Line key={l.id} line={l} onNavigate={onNavigate} />)}</ul>;
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="empty">
      <h3>Your cart is empty</h3>
      <p className="muted">Find a medicine by name, by form, or by concern.</p>
      <Link href="/medicines" className="btn" onClick={onNavigate}>Browse medicines A to Z</Link>
      <Link href="/concerns" className="link" onClick={onNavigate}>Shop by concern</Link>
    </div>
  );
}

export function CartExtras({ cart }: { cart: Cart }) {
  return (<><Discounts cart={cart} /><Note cart={cart} /></>);
}

export function CartDrawer() {
  const { cart, drawer, closeDrawer, ready } = useStore();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawer) return;
    if (cart) trackViewCart(items(cart));
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab' && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea')].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.documentElement.style.overflow = ''; window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer]);

  const has = !!cart && cart.totalQuantity > 0;
  return (
    <div className="drawer" hidden={!drawer} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button type="button" className="scrim" aria-label="Close cart" onClick={closeDrawer} tabIndex={-1} />
      <div className="drawer-panel" ref={panel}>
        <div className="drawer-head">
          <h2 id="drawer-title">Your cart{has ? ` (${cart!.totalQuantity})` : ''}</h2>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Close cart"><CloseIcon /></button>
        </div>
        <div className="drawer-body" data-lenis-prevent>
          {!ready && <div className="skeleton" style={{ height: 90 }} />}
          {ready && !has && <EmptyCart onNavigate={closeDrawer} />}
          {has && (
            <>
              <ShippingBar cart={cart!} />
              <CartLines cart={cart!} onNavigate={closeDrawer} />
              <PrescriptionUpload cart={cart!} />
              <CartExtras cart={cart!} />
            </>
          )}
        </div>
        {has && (
          <div className="drawer-foot">
            <Totals cart={cart!} />
            <CheckoutButton cart={cart!} />
            <Link href="/cart" className="btn-quiet btn-wide" onClick={closeDrawer}>View cart</Link>
          </div>
        )}
      </div>
    </div>
  );
}
