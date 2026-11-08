import Image from 'next/image';
import Link from 'next/link';
import { getCustomer, getOrders, getSession } from '@/lib/shopify/customer';
import { dateIN, gidNumber, money } from '@/lib/format';
import { ProfileForm } from '@/components/Account';
import { OrderStatus } from '@/components/OrderStatus';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AccountHome({ searchParams }: Props) {
  const { error } = await searchParams;
  if (!(await getSession())) return error ? <p className="msg msg-error" role="alert">{error}</p> : null;
  const [c, orders] = await Promise.all([getCustomer(), getOrders()]);
  const recent = orders.nodes.slice(0, 3);
  const def = c.addresses.nodes.find((a) => a.id === c.defaultAddress?.id);
  return (
    <>
      <section className="panel" aria-labelledby="hello">
        <h2 id="hello">Namaskaram{c.firstName ? `, ${c.firstName}` : ''}</h2>
        <p className="muted">{c.emailAddress?.emailAddress}{c.phoneNumber ? ` · ${c.phoneNumber.phoneNumber}` : ''}</p>
        <ProfileForm firstName={c.firstName ?? ''} lastName={c.lastName ?? ''} />
      </section>

      <section className="panel" aria-labelledby="recent-orders">
        <div className="head-row"><h2 id="recent-orders">Recent orders</h2>{orders.nodes.length > 0 && <Link className="link" href="/account/orders">All orders →</Link>}</div>
        {recent.length ? (
          <ul className="orders">
            {recent.map((o) => (
              <li key={o.id} className="order-row">
                <div style={{ display: 'grid', gap: 6 }}>
                  <Link className="name" href={`/account/orders/${gidNumber(o.id)}`}>Order {o.name}</Link>
                  <span className="muted">{dateIN(o.processedAt)} · {money(o.totalPrice)}</span>
                  <div className="order-thumbs">{o.lineItems.nodes.map((l, i) => l.image ? <Image key={i} src={l.image.url} alt={l.title} width={44} height={44} /> : null)}</div>
                </div>
                <OrderStatus order={o} />
              </li>
            ))}
          </ul>
        ) : <p className="muted">No orders yet. <Link href="/medicines">Browse medicines</Link>.</p>}
      </section>

      <section className="panel" aria-labelledby="addr-h">
        <div className="head-row"><h2 id="addr-h">Default address</h2><Link className="link" href="/account/addresses">Manage addresses →</Link></div>
        {def ? <address style={{ fontStyle: 'normal', display: 'grid' }}>{def.formatted.map((l, i) => <span key={i}>{l}</span>)}</address> : <p className="muted">No address saved yet.</p>}
      </section>
    </>
  );
}
