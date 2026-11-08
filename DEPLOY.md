# Putting the Ayur Store live at shop.avvvs.com

The store is a Next.js app that runs on Vercel. Each step below says who does it.

## 1. Shopify first (you, in Shopify admin)

- [ ] **Allow guest checkout.** In **Settings → Customer accounts**, make sign-in optional. Today the store's checkout sends shoppers to a login page, so nobody can buy.
- [ ] **Storefront tokens.** Install the Headless channel, create a storefront and copy its tokens ([SHOPIFY_SETUP.md](SHOPIFY_SETUP.md), step 1).
- [ ] **Customer Account API.** Set it up with the callback `https://shop.avvvs.com/account/callback` (SHOPIFY_SETUP.md, step 2).
- [ ] **Purchase tracking.** Add the custom pixel from [docs/shopify-pixel.js](docs/shopify-pixel.js) (section 4 below).

## 2. Create the Vercel project (you)

1. Go to vercel.com → **Add New → Project** and import the GitHub repository **arjunmurali-2/avvvspharmacy**.
2. Settings:
   - **Framework:** Next.js (detected automatically)
   - **Root directory:** `/`
   - **Region:** the repository's `vercel.json` already pins **Mumbai (bom1)**
3. In **Environment Variables**, add every variable from [.env.example](.env.example) that you have a value for.
   - **At minimum:** `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_API_VERSION` and `NEXT_PUBLIC_SITE_URL=https://shop.avvvs.com`.
   - **Add later:**
     - Storefront tokens, so medicine information and stock counts show
     - `SESSION_SECRET` and `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`, for accounts
     - `BLOB_READ_WRITE_TOKEN`, for prescriptions (add a Blob store under **Storage**)
     - `DATABASE_URL`, for stock alerts (add Neon under **Storage**)
     - SMTP settings, for mail to the pharmacy
     - `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID`, for analytics
     - `SHOPIFY_REVALIDATE_SECRET`, for instant updates
   - **Never** add `SHOPIFY_ADMIN_TOKEN` to Vercel. It is only for the tagging script on your own machine.
4. Click **Deploy**. The first build takes about two minutes.

## 3. The domain (you, at your DNS provider)

1. In Vercel, go to **Project → Settings → Domains** and add `shop.avvvs.com`.
2. At the DNS provider for avvvs.com, add the record Vercel shows. It is usually:
   - **Type:** CNAME
   - **Name:** `shop`
   - **Value:** `cname.vercel-dns.com`
3. Wait for Vercel to show **Valid configuration**. HTTPS is issued automatically.

The main site's "Ayur Store" links already point to `https://shop.avvvs.com/`.

## 4. Purchase tracking (you, in Shopify admin)

Checkout runs on Shopify, so the "purchase" event has to be sent from Shopify:

1. Go to **Settings → Customer events → Add custom pixel** and name it "AVVVS Ayur Store".
2. Paste the contents of `docs/shopify-pixel.js`, and replace the two IDs at the top with your GA4 and Meta Pixel IDs.
3. Set **Permission** to *Required*. Under **Data sale**, choose *Data collected does not qualify as data sale*. Then **Save** and **Connect**.

The store passes the visitor's Google Analytics ID and cookie choice into checkout, so a purchase is joined to the visit that led to it. A shopper who declined analytics is not tracked at checkout either.

## 5. After going live

- [ ] Open `https://shop.avvvs.com/api/health`. It should show `{"ok":true,…}`. Point an uptime monitor (for example UptimeRobot) at it.
- [ ] Place one real low-value order end to end, then cancel and refund it in Shopify.
- [ ] Check the order in Shopify:
  - the note and prescription link appear under **Additional details**
  - GA4 **Realtime** shows the purchase
- [ ] Add the Shopify webhooks for instant catalogue updates (SHOPIFY_SETUP.md, step 5).
- [ ] Submit `https://shop.avvvs.com/sitemap.xml` in Google Search Console.

## Running the checks

```bash
npm run typecheck
```

```bash
npm run build
```

```bash
npm run test:e2e
```

The smoke tests also run on GitHub for every push (`.github/workflows/ci.yml`).
