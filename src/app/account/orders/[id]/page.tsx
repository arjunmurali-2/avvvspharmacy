import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrder, getSession } from '@/lib/shopify/customer';
import { dateIN, money, titleCase } from '@/lib/format';
import { CONTACT } from '@/lib/site';
import { BuyAgain } from '@/components/Account';
import { OrderStatus } from '@/components/OrderStatus';

type Props = { params: Promise<{ id: string }> };

const SHIP: Record<string, string> = {
  LABEL_PRINTED: 'Label printed', LABEL_PURCHASED: 'Label created', CONFIRMED: 'Confirmed by courier', IN_TRANSIT: 'In transit',
  OUT_FOR_DELIVERY: 'Out for delivery', ATTEMPTED_DELIVERY: 'Delivery attempted', DELIVERED: 'Delivered', FAILURE: 'Delivery problem',
  READY_FOR_PICKUP: 'Ready for pickup', PICKED_UP: 'Picked up', CARRIER_PICKED_UP: 'With the courier',
};

export default async function OrderPage({ params }: Props) {
  if (!(await getSession())) return null;
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const o = await getOrder(`gid://shopify/Order/${id}`);
  if (!o) notFound();

  return (
    <>
      <section className="panel" aria-labelledby="order-h">
        <div className="head-row">
          <div style={{ display: 'grid', gap: 6 }}>
            <Link className="link" href="/account/orders">← All orders</Link>
            <h2 id="order-h">Order {o.name}</h2>
            <p className="muted">Placed {dateIN(o.processedAt)}</p>
          </div>
          <OrderStatus order={o} />
        </div>
        <div className="hero-actions">
          <BuyAgain orderId={o.id} />
          <a className="btn-quiet" href={o.statusPageUrl} target="_blank" rel="noopener noreferrer">Order status page ↗</a>
        </div>
      </section>

      {o.fulfillments.nodes.length > 0 && (
        <section className="panel" aria-labelledby="track-h">
          <h2 id="track-h">Delivery</h2>
          <ol className="timeline">
            {o.fulfillments.nodes.map((f) => (
              <li key={f.id} className="is-on">
                <p><b>{f.latestShipmentStatus ? SHIP[f.latestShipmentStatus] ?? titleCase(f.latestShipmentStatus.replace(/_/g, ' ')) : 'Shipped'}</b> <span className="fine">· updated {dateIN(f.updatedAt)}</span></p>
                {f.trackingInformation.map((t, i) => (
                  <p key={i} className="muted">
                    {t.company ?? 'Courier'}{t.number ? `: ${t.number}` : ''}{' '}
                    {t.url && <a href={t.url} target="_blank" rel="noopener noreferrer">Track parcel ↗</a>}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="panel" aria-labelledby="items-h">
        <h2 id="items-h">Items</h2>
        <ul className="lines">
          {o.lineItems.nodes.map((l) => (
            <li key={l.id} className="line">
              <div className="line-img">{l.image && <Image src={l.image.url} alt="" width={76} height={76} />}</div>
              <div>
                <p className="line-title">{titleCase(l.title)}</p>
                <p className="line-meta">{l.variantTitle && l.variantTitle !== 'Default Title' ? `${l.variantTitle} · ` : ''}Qty {l.quantity}{l.price ? ` · ${money(l.price)} each` : ''}</p>
              </div>
              <p className="line-price">{l.totalPrice ? money(l.totalPrice) : ''}</p>
            </li>
          ))}
        </ul>
        <div className="totals">
          {o.subtotal && <div><span>Subtotal</span><span>{money(o.subtotal)}</span></div>}
          <div><span>Delivery</span><span>{money(o.totalShipping)}</span></div>
          {o.totalTax && Number(o.totalTax.amount) > 0 && <div><span>Tax</span><span>{money(o.totalTax)}</span></div>}
          <div className="grand"><span>Total</span><span>{money(o.totalPrice)}</span></div>
        </div>
      </section>

      {o.shippingAddress && (
        <section className="panel" aria-labelledby="ship-h">
          <h2 id="ship-h">Shipping to</h2>
          <address style={{ fontStyle: 'normal', display: 'grid' }}>{o.shippingAddress.formatted.map((l, i) => <span key={i}>{l}</span>)}</address>
        </section>
      )}
      <p className="fine">Need help with this order? Call {CONTACT.phones[0]} or <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hello, I need help with order ${o.name}.`)}`} rel="noopener">WhatsApp us</a> with the order number.</p>
    </>
  );
}
