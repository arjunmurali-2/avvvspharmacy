'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { removeAddress, reorder, saveAddress, saveProfile, type FormState } from '@/app/actions';
import type { Address } from '@/lib/shopify/customer';
import { useStore } from './StoreProvider';

const NAV = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/wishlist', label: 'Wishlist' },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="acct-nav" aria-label="Account">
      {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={path === n.href || (n.href !== '/account' && path.startsWith(n.href)) ? 'page' : undefined}>{n.label}</Link>)}
      <form action="/account/logout" method="post"><button type="submit">Sign out</button></form>
    </nav>
  );
}

export function BuyAgain({ orderId, small }: { orderId: string; small?: boolean }) {
  const { setCart, openDrawer, toast } = useStore();
  const [pending, start] = useTransition();
  return (
    <button type="button" className={`${small ? 'btn-quiet btn-sm' : 'btn'}`} disabled={pending} onClick={() => start(async () => {
      const r = await reorder(orderId);
      if (r.cart) { setCart(r.cart); openDrawer(); }
      if (r.error) toast({ text: r.error, tone: 'error' });
      else if (r.skipped) toast({ text: `${r.skipped} item${r.skipped === 1 ? ' is' : 's are'} no longer available and ${r.skipped === 1 ? 'was' : 'were'} left out.` });
    })}>{pending ? 'Adding…' : 'Buy again'}</button>
  );
}

function Status({ state }: { state: FormState }) {
  if (state.error) return <p className="msg msg-error" role="alert">{state.error}</p>;
  if (state.ok) return <p className="msg msg-ok" role="status">Saved.</p>;
  return null;
}

export function ProfileForm({ firstName, lastName }: { firstName: string; lastName: string }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  return (
    <form action={action} className="form-grid">
      <div className="field"><label htmlFor="fn">First name</label><input id="fn" name="firstName" className="input" defaultValue={firstName} autoComplete="given-name" /></div>
      <div className="field"><label htmlFor="ln">Last name</label><input id="ln" name="lastName" className="input" defaultValue={lastName} autoComplete="family-name" /></div>
      <div className="full" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <button type="submit" className="btn-quiet" disabled={pending}>{pending ? 'Saving…' : 'Save name'}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

// Indian states and union territories, with Shopify's zone codes.
const ZONES: [string, string][] = [
  ['AN', 'Andaman and Nicobar Islands'], ['AP', 'Andhra Pradesh'], ['AR', 'Arunachal Pradesh'], ['AS', 'Assam'], ['BR', 'Bihar'], ['CH', 'Chandigarh'],
  ['CG', 'Chhattisgarh'], ['DN', 'Dadra and Nagar Haveli and Daman and Diu'], ['DL', 'Delhi'], ['GA', 'Goa'], ['GJ', 'Gujarat'], ['HR', 'Haryana'],
  ['HP', 'Himachal Pradesh'], ['JK', 'Jammu and Kashmir'], ['JH', 'Jharkhand'], ['KA', 'Karnataka'], ['KL', 'Kerala'], ['LA', 'Ladakh'], ['LD', 'Lakshadweep'],
  ['MP', 'Madhya Pradesh'], ['MH', 'Maharashtra'], ['MN', 'Manipur'], ['ML', 'Meghalaya'], ['MZ', 'Mizoram'], ['NL', 'Nagaland'], ['OR', 'Odisha'],
  ['PY', 'Puducherry'], ['PB', 'Punjab'], ['RJ', 'Rajasthan'], ['SK', 'Sikkim'], ['TN', 'Tamil Nadu'], ['TS', 'Telangana'], ['TR', 'Tripura'],
  ['UP', 'Uttar Pradesh'], ['UK', 'Uttarakhand'], ['WB', 'West Bengal'],
];

export function AddressForm({ address, isDefault, onDone }: { address?: Address; isDefault?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveAddress, {});
  useEffect(() => { if (state.ok) { onDone?.(); router.refresh(); } }, [state, onDone, router]);
  const a = address;
  return (
    <form action={action} className="form-grid panel">
      {a && <input type="hidden" name="id" value={a.id} />}
      <input type="hidden" name="territoryCode" value="IN" />
      <div className="field"><label htmlFor="a-fn">First name</label><input id="a-fn" name="firstName" className="input" defaultValue={a?.firstName ?? ''} required autoComplete="given-name" /></div>
      <div className="field"><label htmlFor="a-ln">Last name</label><input id="a-ln" name="lastName" className="input" defaultValue={a?.lastName ?? ''} required autoComplete="family-name" /></div>
      <div className="field full"><label htmlFor="a-1">Address</label><input id="a-1" name="address1" className="input" defaultValue={a?.address1 ?? ''} required autoComplete="address-line1" placeholder="House, street" /></div>
      <div className="field full"><label htmlFor="a-2">Area, landmark <span className="muted">(optional)</span></label><input id="a-2" name="address2" className="input" defaultValue={a?.address2 ?? ''} autoComplete="address-line2" /></div>
      <div className="field"><label htmlFor="a-c">City</label><input id="a-c" name="city" className="input" defaultValue={a?.city ?? ''} required autoComplete="address-level2" /></div>
      <div className="field"><label htmlFor="a-z">PIN code</label><input id="a-z" name="zip" className="input" defaultValue={a?.zip ?? ''} required inputMode="numeric" pattern="[0-9]{6}" title="Six-digit PIN code" autoComplete="postal-code" /></div>
      <div className="field"><label htmlFor="a-s">State</label>
        <select id="a-s" name="zoneCode" className="select" defaultValue={a?.zoneCode ?? 'KL'} required>
          {ZONES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="a-p">Phone</label><input id="a-p" name="phoneNumber" className="input" type="tel" defaultValue={a?.phoneNumber ?? ''} autoComplete="tel" placeholder="+91" /></div>
      <label className="check full"><input type="checkbox" name="default" defaultChecked={isDefault} />Use as my default address</label>
      <div className="full" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" className="btn" disabled={pending}>{pending ? 'Saving…' : a ? 'Save address' : 'Add address'}</button>
        {onDone && <button type="button" className="btn-quiet" onClick={onDone}>Cancel</button>}
        <Status state={state} />
      </div>
    </form>
  );
}

export function AddressBook({ addresses, defaultId }: { addresses: Address[]; defaultId?: string }) {
  const router = useRouter();
  const { toast } = useStore();
  const [editing, setEditing] = useState<string | 'new' | null>(addresses.length ? null : 'new');
  const [pending, start] = useTransition();
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {editing === 'new' ? <AddressForm onDone={addresses.length ? () => setEditing(null) : undefined} isDefault={!addresses.length} /> :
        <div><button type="button" className="btn-quiet" onClick={() => setEditing('new')}>Add a new address</button></div>}
      <ul className="addr-list">
        {addresses.map((a) => (
          <li key={a.id}>
            {editing === a.id ? <AddressForm address={a} isDefault={a.id === defaultId} onDone={() => setEditing(null)} /> : (
              <div className="addr">
                <div style={{ display: 'grid', gap: 6 }}>
                  {a.id === defaultId && <span className="status is-done" style={{ justifySelf: 'start' }}>Default</span>}
                  <address>{a.formatted.map((l, i) => <span key={i}>{l}</span>)}</address>
                </div>
                <div className="addr-actions">
                  <button type="button" className="link" onClick={() => setEditing(a.id)}>Edit</button>
                  <button type="button" className="link" disabled={pending} onClick={() => {
                    if (!window.confirm('Delete this address?')) return;
                    start(async () => { const r = await removeAddress(a.id); if (r.error) toast({ text: r.error, tone: 'error' }); router.refresh(); });
                  }}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
