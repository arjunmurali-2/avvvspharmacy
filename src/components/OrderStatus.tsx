import type { OrderSummary } from '@/lib/shopify/customer';

const LABEL: Record<string, string> = {
  FULFILLED: 'Delivered to courier', UNFULFILLED: 'Being prepared', PARTIALLY_FULFILLED: 'Partly shipped', IN_PROGRESS: 'Being prepared',
  ON_HOLD: 'On hold', OPEN: 'Being prepared', PENDING_FULFILLMENT: 'Being prepared', SCHEDULED: 'Scheduled', RESTOCKED: 'Returned',
};
const PAY: Record<string, string> = { PAID: 'Paid', PENDING: 'Payment pending', REFUNDED: 'Refunded', PARTIALLY_REFUNDED: 'Partly refunded', VOIDED: 'Cancelled', AUTHORIZED: 'Payment authorised', PARTIALLY_PAID: 'Partly paid' };

export function OrderStatus({ order }: { order: Pick<OrderSummary, 'cancelledAt' | 'fulfillmentStatus' | 'financialStatus'> }) {
  if (order.cancelledAt) return <span className="status is-cancel">Cancelled</span>;
  const f = LABEL[order.fulfillmentStatus] ?? order.fulfillmentStatus.toLowerCase().replace(/_/g, ' ');
  const p = order.financialStatus ? PAY[order.financialStatus] : null;
  return (
    <span style={{ display: 'grid', gap: 6, justifyItems: 'end', alignContent: 'start' }}>
      <span className={`status${order.fulfillmentStatus === 'FULFILLED' ? ' is-done' : ''}`}>{f}</span>
      {p && <span className="fine">{p}</span>}
    </span>
  );
}
