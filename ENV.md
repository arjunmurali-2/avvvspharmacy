# Environment variables for the Ayur Store

Every setting the store reads, what each one does, where to get its value, and where to put it.

## Where the values go

| Place | What goes there | How |
|---|---|---|
| **Vercel** (the live site) | Everything below marked **Vercel** | Vercel → the `avvvspharmacy` project → **Settings → Environment Variables**. Tick **Production** (and **Preview** if you want preview links to work the same way). **Redeploy** after any change. Variables starting with `NEXT_PUBLIC_` are fixed into the site when it is built, so they only take effect after a redeploy. |
| **`store/.env.local`** (your computer) | The same values, for running the store locally, plus `SHOPIFY_ADMIN_TOKEN` | Copy `.env.example` to `.env.local` and fill it in. Git ignores this file, so it is never pushed. |
| **GitHub** | Nothing | The CI workflow sets its own two values and needs no secrets. |
| **Shopify** | Not environment variables, but two IDs to paste | The custom pixel (`docs/shopify-pixel.js`) has `GA4_ID` and `META_PIXEL_ID` at the top; set them to the same values as `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID`. |

**Never put `SHOPIFY_ADMIN_TOKEN` in Vercel.** It can edit every product in the shop; it is only for the tagging script on your own machine.

---

## 1. Shopify catalogue and cart (needed)

The store works with only the first two of these. The tokens switch on medicine information (metafields), stock counts and higher rate limits.

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | Vercel + local | `avvvsglobal.myshopify.com` | No |
| `SHOPIFY_API_VERSION` | Vercel + local | `2026-10` | No |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Vercel + local | Shopify admin → **Sales channels → Headless** → your storefront → **Storefront API** → *Public access token* | No (meant to be public) |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Vercel + local | Same screen → *Private access token*. Used only on the server. | **Yes** |

Setup steps (installing Headless, permissions): `SHOPIFY_SETUP.md` §1.

## 2. Customer sign-in (needed for accounts, orders, synced wishlist)

Without these, the sign-in link shows a "coming soon" message and everything else still works.

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Vercel + local | **Headless** → your storefront → **Customer Account API** → *Client ID* | No |
| `SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN` | Vercel + local | `checkout.avvvs.com` (the shop's primary domain in Shopify, where checkout runs) | No |
| `SESSION_SECRET` | Vercel + local | 32+ random characters. Make one with `openssl rand -base64 32`. Encrypts the sign-in cookie; changing it signs everyone out. | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | Vercel + local | `https://shop.avvvs.com` on Vercel. Locally: `http://localhost:3001`, or your ngrok address when testing sign-in. Also used for canonical links, the sitemap and share links. | No |

In Shopify, set the callback to `https://shop.avvvs.com/account/callback`, the JavaScript origin and logout URI to `https://shop.avvvs.com`. Sign-in does not work on `localhost` or on Vercel preview URLs unless you add those addresses in Shopify too. Details: `SHOPIFY_SETUP.md` §2.

## 3. Instant updates from Shopify (recommended)

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `SHOPIFY_REVALIDATE_SECRET` | Vercel | Any long random string you make up. Put the same string at the end of each Shopify webhook URL: `https://shop.avvvs.com/api/revalidate?secret=<this>` | **Yes** |

Without it, pages still refresh from Shopify every 5 minutes. Webhook list: `SHOPIFY_SETUP.md` §5.

## 4. Prescription uploads (optional)

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel (+ local to test) | Vercel → the project → **Storage → Create → Blob**. Connecting the store to the project adds this variable for you. | **Yes** |

Without it, the upload box asks customers to email their prescription instead.

## 5. Back-in-stock alerts (optional)

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `DATABASE_URL` | Vercel (+ local to test) | A Neon Postgres connection string (Vercel → **Storage → Neon**, or neon.tech). Can be the same database as the main site. The `stock_alerts` table is created on first use. | **Yes** |

## 6. Mail to the pharmacy (optional, used by stock alerts)

Use the same values as the main site (`web/`).

| Variable | Where | Value | Secret? |
|---|---|---|---|
| `SMTP_HOST` | Vercel | Your mail server, e.g. `smtp.gmail.com` or your host's | No |
| `SMTP_PORT` | Vercel | `465` (default) | No |
| `SMTP_SECURE` | Vercel | `true` for port 465, `false` for 587 | No |
| `SMTP_USER` | Vercel | The mailbox login | No |
| `SMTP_PASS` | Vercel | The mailbox password or app password | **Yes** |
| `MAIL_FROM` | Vercel | Sender, e.g. `AVVVS Ayur Store <store@avvvs.com>`. Defaults to `SMTP_USER`. | No |
| `MAIL_TO` | Vercel | Where pharmacy notices go, e.g. the pharmacy inbox | No |

Mail is skipped quietly if `SMTP_HOST` or `MAIL_TO` is empty.

## 7. Analytics and search (optional)

These only run after a visitor accepts the matching cookies.

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `NEXT_PUBLIC_GA_ID` | Vercel | Google Analytics 4 → **Admin → Data streams** → *Measurement ID* (`G-XXXXXXX`) | No |
| `NEXT_PUBLIC_META_PIXEL_ID` | Vercel | Meta Events Manager → your pixel's ID (digits) | No |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Vercel | Google Search Console → add `shop.avvvs.com` → **HTML tag** method → the `content` value only | No |

## 8. Store settings (optional)

| Variable | Where | Value | Secret? |
|---|---|---|---|
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | Vercel | Order value in INR for free delivery, e.g. `999`. Shows a progress bar in the cart. Must match your Shopify shipping rule. Empty hides the bar. | No |
| `NEXT_PUBLIC_WHATSAPP` | Vercel | WhatsApp number, digits with country code, e.g. `918089202091`. Empty uses that number. | No |

## 9. Your computer only

| Variable | Where | Value / where to get it | Secret? |
|---|---|---|---|
| `SHOPIFY_ADMIN_TOKEN` | **`.env.local` only, never Vercel** | Shopify admin → **Settings → Apps → Develop apps** → create an app with `read_products` and `write_products` → install → *Admin API access token*. Used only by `npm run tag-concerns`. | **Yes** |
| `E2E_PORT`, `E2E_BASE_URL` | Your shell, if needed | Only for the Playwright tests: a different port, or testing an already-deployed site instead of building locally. | No |

---

## Quick copy for Vercel

Minimum to go live (catalogue, cart, checkout, sign-in, instant updates):

```
SHOPIFY_STORE_DOMAIN=avvvsglobal.myshopify.com
SHOPIFY_API_VERSION=2026-10
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN=checkout.avvvs.com
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=https://shop.avvvs.com
SHOPIFY_REVALIDATE_SECRET=
```

Vercel can import this: **Environment Variables → Import .env**, or paste it into the first field and it splits the lines for you.

After adding them, redeploy, then open `https://shop.avvvs.com/api/health`. It should say `"ok": true` and `"token": true`.
