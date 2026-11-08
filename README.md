# avvvspharmacy

The **AVVVS Ayur Store** is the online pharmacy for Arya Vaidya Vilasini Vaidya Sala, Kozhikode (since 1921). It is a headless Next.js storefront on the AVVVS Shopify store, served at `shop.avvvs.com`.

- **Stack:** Next.js 15 (App Router), React 19, TypeScript and plain CSS. It uses the same design language as avvvs.com.
- **Data:** Shopify Storefront API for the catalogue, search and cart. Shopify Customer Account API for sign-in, orders and addresses.
- **Checkout:** Shopify's hosted checkout.

## Run it

```bash
npm install
npm run dev -- --port 3001
```

It works straight away with Shopify's tokenless access. Copy `.env.example` to `.env.local` and follow [SHOPIFY_SETUP.md](SHOPIFY_SETUP.md) to switch on the following:
- medicine information
- accounts
- prescription uploads
- stock alerts
- instant cache refresh

## What's in it

- **Browse**
  - shop by concern (twelve hospital-style departments)
  - shop by form (kashayam, arishtam, thailam…)
  - the Classical, Proprietary and Cosmetics collections
  - a Medicines A–Z index that tolerates spelling variants
- **Search:** instant search (`/` or Ctrl+K) with keyboard navigation, and a full results page with filters
- **Filters:** stock, price and form, all kept in the URL; sorting; "show more" paging
- **Product page**
  - gallery with zoom
  - MRP and savings, stock status, quantity, Add to cart and Buy now
  - medicine information from `pharmacy.*` metafields
  - doctor-advice notice
  - back-in-stock alerts
  - related products, more of the same form, and recently viewed
  - share, print, and Product structured data
- **Cart**
  - slide-out drawer and full page, with optimistic quantity changes and undo
  - discount codes and a note for the pharmacy
  - optional prescription upload, which is attached to the Shopify order
  - free-delivery progress bar
  - suggestions
  - Shopify checkout
- **Account**
  - passwordless sign-in through the Customer Account API
  - orders with delivery tracking, and Buy again
  - address book and profile
  - wishlist synced to the account
- **Trust and help**
  - store policies and pages pulled from Shopify
  - WhatsApp help button
  - pharmacy disclaimer
  - cookie consent, plus GA4 ecommerce events and Meta Pixel (after consent)
- **Quality:** sitemap, robots and manifest; per-page metadata; accessible menus and dialogs; respects reduced motion

The store never invents prices, reviews or medical claims. Everything shown comes from Shopify.
