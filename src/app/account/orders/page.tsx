import Image from 'next/image';
import Link from 'next/link';
import { getOrders, getSession } from '@/lib/shopify/customer';
import { dateIN, gidNumber, money } from '@/lib/format';
import { BuyAgain } from '@/components/Account';
import { OrderStatus } from '@/components/OrderStatus';
import { fitted } from '@/lib/shopify/image';

type Props = { searchParams: Promise<{ after?: string }> };

export default async function Orders({ searchParams }: Props) {
  if (!(await getSession())) return null;
  const { after } = await searchParams;
  const orders = await getOrders(after);
  return (
    <section className="panel" aria-labelledby="orders-h">
      <h2 id="orders-h">Your orders</h2>
      {orders.nodes.length ? (
        <ul className="orders" data-anim="stagger">
          {orders.nodes.map((o) => (
            <li key={o.id} className="order-row">
              <div style={{ display: 'grid', gap: 6 }}>
                <Link className="name" href={`/account/orders/${gidNumber(o.id)}`}>Order {o.name}</Link>
                <span className="muted">{dateIN(o.processedAt)}, {money(o.totalPrice)}, {o.lineItems.nodes.reduce((s, l) => s + l.quantity, 0)} items</span>
                <div className="order-thumbs">{o.lineItems.nodes.map((l, i) => l.image ? <Image key={i} src={fitted(l.image.url)} alt={l.title} width={44} height={44} /> : null)}</div>
              </div>
              <div style={{ display: 'grid', gap: 10, justifyItems: 'end', alignContent: 'start' }}>
                <OrderStatus order={o} />
                <BuyAgain orderId={o.id} small />
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="muted">No orders yet.</p>}
      {orders.pageInfo.hasNextPage && orders.pageInfo.endCursor && (
        <Link className="btn-quiet" href={`/account/orders?after=${encodeURIComponent(orders.pageInfo.endCursor)}`}>Older orders</Link>
      )}
    </section>
  );
}
