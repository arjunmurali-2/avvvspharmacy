import { getCustomer, getSession } from '@/lib/shopify/customer';
import { AddressBook } from '@/components/Account';

export default async function Addresses() {
  if (!(await getSession())) return null;
  const c = await getCustomer();
  return (
    <section className="panel" aria-labelledby="addr-h">
      <h2 id="addr-h">Addresses</h2>
      <p className="muted">Saved addresses are offered at checkout.</p>
      <AddressBook addresses={c.addresses.nodes} defaultId={c.defaultAddress?.id} />
    </section>
  );
}
