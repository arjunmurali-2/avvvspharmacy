'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useTransition } from 'react';
import { buyNow } from '@/app/actions';
import type { Image as Img, Product } from '@/lib/shopify/types';
import { amount, money, titleCase } from '@/lib/format';
import { CONTACT } from '@/lib/site';
import { checkoutTracking, trackBeginCheckout, trackViewItem } from '@/lib/track';
import { Qty } from './Cart';
import { PrintIcon, ShieldIcon, LeafIcon, TruckIcon, RxIcon } from './Icons';
import { WishButton, itemOf } from './ProductTile';
import { useStore } from './StoreProvider';
import { fitted } from '@/lib/shopify/image';

export function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const img = images[i];
  if (!img) return <div className="gallery single"><div className="gallery-main" style={{ cursor: 'default' }}><span className="tile-noimg" aria-hidden="true">{name.charAt(0)}</span></div></div>;
  return (
    <div className={`gallery${images.length < 2 ? ' single' : ''}`} data-anim="fade">
      <button type="button" className={`gallery-main${zoom ? ' is-zoom' : ''}`} aria-label={zoom ? 'Zoom out' : 'Zoom in'}
        onClick={() => setZoom((z) => !z)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}
        onMouseLeave={() => setZoom(false)} style={{ padding: 0 }}>
        <Image src={fitted(img.url)} alt={img.altText || name} fill priority sizes="(max-width: 900px) 100vw, 50vw" style={{ transformOrigin: origin }} />
      </button>
      {images.length > 1 && (
        <ul className="thumbs" aria-label="Product photos">
          {images.map((im, n) => (
            <li key={im.url}>
              <button type="button" aria-current={n === i} aria-label={`Photo ${n + 1} of ${images.length}`} onClick={() => { setI(n); setZoom(false); }}>
                <Image src={fitted(im.url)} alt="" width={74} height={74} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Notify({ product }: { product: Product }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setState('sending');
    const r = await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: d.get('email'), hp: d.get('company'), handle: product.handle, title: titleCase(product.title) }) })
      .then((x) => x.json()).catch(() => ({ error: 'Could not send. Please try again.' }));
    if (r.error) { setState('error'); setMsg(r.error); } else setState('done');
  };
  if (state === 'done') return <p className="msg msg-ok" role="status" id="notify">Thank you. We’ll email you when {titleCase(product.title)} is back in stock.</p>;
  return (
    <form id="notify" className="field" onSubmit={send}>
      <label htmlFor="notify-email">Email me when it’s back in stock</label>
      <div className="inline-form">
        <input id="notify-email" name="email" type="email" required className="input" placeholder="you@example.com" autoComplete="email" />
        <input name="company" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
        <button type="submit" className="btn-quiet" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Notify me'}</button>
      </div>
      {state === 'error' && <p className="msg msg-error" role="alert">{msg}</p>}
      <p className="fine">Or ask the pharmacy: <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hello, is ${titleCase(product.title)} available?`)}`} rel="noopener">WhatsApp</a>, or call <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`}>{CONTACT.phones[0]}</a></p>
    </form>
  );
}

function Share({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  // the page address is only known in the browser; fill it in after hydration
  const [here, setHere] = useState('');
  useEffect(() => setHere(window.location.href), []);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: name, url }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <div className="share">
      <button type="button" onClick={share}>{copied ? 'Link copied' : 'Share'}</button>
      <a href={`https://wa.me/?text=${encodeURIComponent(name)}%20${encodeURIComponent(here)}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
      <button type="button" onClick={() => window.print()}><PrintIcon className="" /> Print</button>
    </div>
  );
}

export function BuyBox({ product, hasAlternatives }: { product: Product; hasAlternatives?: boolean }) {
  const { add, busy, toast } = useStore();
  const variants = product.variants.nodes;
  const [vid, setVid] = useState(() => (variants.find((v) => v.availableForSale) ?? variants[0])?.id);
  const v = variants.find((x) => x.id === vid) ?? variants[0];
  const [qty, setQty] = useState(1);
  const [going, startGo] = useTransition();
  const [stuck, setStuck] = useState(false);
  const actions = useRef<HTMLDivElement>(null);

  // phones: once the buy buttons scroll away, a slim bar keeps them in reach
  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!v) return null;
  const name = titleCase(product.title);
  const was = v.compareAtPrice && amount(v.compareAtPrice) > amount(v.price) ? v.compareAtPrice : null;
  const pct = was ? Math.round((1 - amount(v.price) / amount(was)) * 100) : 0;
  const max = v.quantityAvailable && v.quantityAvailable > 0 ? Math.min(99, v.quantityAvailable) : 99;
  const low = typeof v.quantityAvailable === 'number' && v.quantityAvailable > 0 && v.quantityAvailable <= 5;
  const item = { ...itemOf(product), id: v.id, price: amount(v.price) };
  const multi = variants.length > 1 || (variants[0] && variants[0].title !== 'Default Title');

  const addIt = () => add(v.id, qty, item);
  const now = () => startGo(async () => {
    trackBeginCheckout([{ ...item, quantity: qty }]);
    const r = await buyNow(v.id, qty, checkoutTracking());
    if (r.url) window.location.href = r.url; else toast({ text: r.error ?? 'Checkout could not be started.', tone: 'error' });
  });

  return (
    <>
      <div className="buy-card">
      <div className="buy-top">
        <div className="buy-price">
          <strong>{money(v.price)}</strong>
          {was && <><s>MRP {money(was)}</s><span className="save">Save {pct}%</span></>}
        </div>
        <p className={`stock${!v.availableForSale ? ' is-out' : low ? ' is-low' : ''}`}>
          {!v.availableForSale ? 'Out of stock' : low ? `In stock: only ${v.quantityAvailable} left` : 'In stock, ready to ship'}
        </p>
      </div>

      {multi && (
        <div className="field">
          <span className="label">{product.options[0]?.name && product.options[0].name !== 'Title' ? product.options[0].name : 'Pack'}</span>
          <div className="variants" role="group" aria-label="Choose a pack">
            {variants.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === v.id} disabled={!x.availableForSale && x.id !== v.id} onClick={() => { setVid(x.id); setQty(1); }}>
                {x.title === 'Default Title' ? 'Standard' : x.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={actions}>
        {v.availableForSale ? (
          <div className="buy-row">
            <Qty value={qty} onChange={(n) => setQty(Math.max(1, Math.min(max, n)))} max={max} label="Quantity" large />
            <button type="button" className="btn" onClick={addIt} disabled={busy}>{busy ? 'Adding…' : 'Add to cart'}</button>
            <button type="button" className="btn-quiet" onClick={now} disabled={going}>{going ? 'Opening checkout…' : 'Buy now'}</button>
            <WishButton product={product} inline />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            <Notify product={product} />
            {hasAlternatives && <a className="link" href="#alternatives">See in-stock medicines for similar uses</a>}
            <WishButton product={product} inline />
          </div>
        )}
      </div>

      <ul className="assure">
        <li><LeafIcon />Made by AVVVS in our GMP-certified factory</li>
        <li><ShieldIcon />Secure checkout by Shopify</li>
        <li><RxIcon />Attach a prescription in your cart, if you have one</li>
        <li><TruckIcon />Delivery options and charges shown at checkout</li>
      </ul>
      </div>
      <Share name={name} />

      <div className={`sticky-buy${stuck && v.availableForSale ? ' is-on' : ''}`} aria-hidden={!stuck}>
        <div className="p"><b>{name}</b><span>{money(v.price)}</span></div>
        <button type="button" className="btn" onClick={addIt} disabled={busy} tabIndex={stuck ? 0 : -1}>Add to cart</button>
      </div>
    </>
  );
}

export function ProductTracker({ product }: { product: Product }) {
  const { noteViewed } = useStore();
  useEffect(() => {
    noteViewed(product.handle);
    trackViewItem(itemOf(product));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.handle]);
  return null;
}
