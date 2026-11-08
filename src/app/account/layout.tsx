import type { Metadata } from 'next';
import { Crumbs } from '@/components/Crumbs';
import { AccountNav } from '@/components/Account';
import { ACCOUNTS_ENABLED, getSession } from '@/lib/shopify/customer';
import { CONTACT } from '@/lib/site';

export const metadata: Metadata = { title: 'Your account', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="wrap">
      <header className="head" data-anim>
        <Crumbs trail={[{ name: 'Your account' }]} />
        <h1>Your account</h1>
      </header>
      {!ACCOUNTS_ENABLED ? (
        <div className="empty" style={{ paddingBottom: 100 }}>
          <h2>Accounts are coming soon</h2>
          <p className="muted" style={{ maxWidth: '34rem' }}>You can check out as a guest today; Shopify emails your order confirmation and tracking. For help with an order, call {CONTACT.phones[0]} or email {CONTACT.email}.</p>
        </div>
      ) : !session ? (
        <SignInPrompt />
      ) : (
        <div className="acct">
          <AccountNav />
          <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>{children}</div>
        </div>
      )}
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="consult" style={{ paddingBottom: 100 }}>
      <div className="consult-copy">
        <h2>Sign in with your email</h2>
        <p className="head-lede">No password to remember: Shopify emails you a one-time code. Signed in, you can see every order, track deliveries, reorder in one click and keep your addresses and wishlist.</p>
        <a className="btn" href="/account/login">Sign in or create an account</a>
        <p className="fine">New here? The same button creates your account.</p>
      </div>
      <ol className="consult-steps">
        <li><b>01</b><span>Order history and delivery tracking</span></li>
        <li><b>02</b><span>Buy again: refill a past order in one click</span></li>
        <li><b>03</b><span>Saved addresses, and your wishlist on every device</span></li>
      </ol>
    </div>
  );
}
