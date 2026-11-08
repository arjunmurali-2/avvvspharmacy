// AVVVS Ayur Store: Shopify custom pixel
// Paste this into Shopify admin → Settings → Customer events → Add custom pixel.
// It reports purchases (and checkout progress) to Google Analytics 4 and the Meta Pixel, because
// checkout runs on Shopify, not on shop.avvvs.com.
//
// The store passes two hidden cart attributes into checkout:
//   _ga_client_id  the visitor's GA4 client id, so the purchase joins the visit that led to it
//   _consent       "analytics,marketing" / "analytics" / "none": the choice made in the store's
//                  cookie banner. Nothing is sent to a service the shopper did not allow.

const GA4_ID = 'G-XXXXXXXXXX';        // ← your GA4 measurement ID
const META_PIXEL_ID = '000000000000'; // ← your Meta Pixel ID (or leave as is to turn Meta off)

const attr = (checkout, key) => (checkout.attributes || []).find((a) => a.key === key)?.value || '';
const allowed = (checkout, what) => {
  const c = attr(checkout, '_consent');
  if (c) return c.split(',').includes(what);
  // no store choice recorded (e.g. checkout opened directly): follow Shopify's own consent banner
  return what === 'analytics' ? init.customerPrivacy?.analyticsProcessingAllowed : init.customerPrivacy?.marketingAllowed;
};

let gaReady = false;
function loadGa(clientId) {
  if (gaReady || !GA4_ID.startsWith('G-') || GA4_ID === 'G-XXXXXXXXXX') return false;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false, ...(clientId ? { client_id: clientId } : {}) });
  gaReady = true;
  return true;
}

let fbReady = false;
function loadFb() {
  if (fbReady || !/^\d{10,}$/.test(META_PIXEL_ID) || META_PIXEL_ID === '000000000000') return false;
  /* Meta's standard bootstrap */
  const n = (window.fbq = function fbq() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
  n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', META_PIXEL_ID);
  fbReady = true;
  return true;
}

const items = (checkout) => (checkout.lineItems || []).map((l) => ({
  item_id: l.variant?.id,
  item_name: l.variant?.product?.title || l.title,
  price: Number(l.variant?.price?.amount || 0),
  quantity: l.quantity,
  item_brand: 'AVVVS',
}));

function prepare(checkout) {
  if (allowed(checkout, 'analytics')) loadGa(attr(checkout, '_ga_client_id'));
  if (allowed(checkout, 'marketing')) loadFb();
}

analytics.subscribe('checkout_started', (event) => {
  const c = event.data.checkout;
  prepare(c);
  if (gaReady) window.gtag('event', 'begin_checkout', { currency: c.currencyCode, value: Number(c.totalPrice?.amount || 0), items: items(c) });
});

analytics.subscribe('payment_info_submitted', (event) => {
  const c = event.data.checkout;
  prepare(c);
  if (gaReady) window.gtag('event', 'add_payment_info', { currency: c.currencyCode, value: Number(c.totalPrice?.amount || 0), items: items(c) });
});

analytics.subscribe('checkout_completed', (event) => {
  const c = event.data.checkout;
  prepare(c);
  const value = Number(c.totalPrice?.amount || 0);
  const transactionId = c.order?.id || c.token;
  if (gaReady) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: c.currencyCode,
      value,
      tax: Number(c.totalTax?.amount || 0),
      shipping: Number(c.shippingLine?.price?.amount || 0),
      coupon: (c.discountApplications || []).map((d) => d.title).filter(Boolean).join(','),
      items: items(c),
    });
  }
  if (fbReady) {
    window.fbq('track', 'Purchase', {
      value,
      currency: c.currencyCode,
      content_type: 'product',
      content_ids: (c.lineItems || []).map((l) => l.variant?.id),
      num_items: (c.lineItems || []).reduce((s, l) => s + l.quantity, 0),
    }, { eventID: String(transactionId) });
  }
});
