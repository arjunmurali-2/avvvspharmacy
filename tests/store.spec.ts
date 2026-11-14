import { expect, test } from '@playwright/test';

// The everyday paths a customer takes. Each test starts with no cookies (a new visitor).

test.beforeEach(async ({ page }) => {
  // keep the cookie banner out of the way: record "essential only" before the page loads
  await page.addInitScript(() => localStorage.setItem('avvvs-consent', JSON.stringify({ analytics: false, marketing: false, at: 'test' })));
});

test('health check reaches Shopify', async ({ request }) => {
  const r = await request.get('/api/health');
  expect(r.ok()).toBeTruthy();
  expect((await r.json()).ok).toBe(true);
});

test('home page shows forms, concerns and products', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ayurveda medicines');
  await expect(page.locator('.forms li')).toHaveCount(10);
  await expect(page.locator('.concerns li')).toHaveCount(12);
  await expect(page.locator('.tile').first()).toBeVisible();
});

test('concern page lists medicines and filters by form and stock', async ({ page }) => {
  await page.goto('/concerns/pain-management?stock=1&form=thailam');
  await expect(page.getByRole('heading', { level: 1, name: 'Pain management' })).toBeVisible();
  const forms = page.locator('.listing .tile-form');
  await expect(forms.first()).toBeVisible();
  for (const f of await forms.allTextContents()) expect(f).toBe('Thailam');
  await expect(page.locator('.listing .tile.is-out')).toHaveCount(0);
});

test('product page shows rewritten content and how to take it', async ({ page }) => {
  await page.goto('/products/dhanwantharam-thailam');
  await expect(page.getByRole('heading', { level: 1, name: 'Dhanwantharam Thailam' })).toBeVisible();
  await expect(page.locator('.about-lede')).toContainText('classical oils of Kerala');
  await expect(page.locator('.uses li').first()).toBeVisible();
  await expect(page.getByText('How to take it')).toBeVisible();
});

test('add to cart, change quantity, and reject a bad discount code', async ({ page }) => {
  await page.goto('/products/rich-meal');
  await page.getByRole('button', { name: 'Add to cart', exact: true }).first().click();
  const drawer = page.getByRole('dialog', { name: /Your cart/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('.line')).toHaveCount(1);

  await drawer.getByRole('button', { name: 'One more' }).click();
  await expect(drawer.getByRole('heading', { name: 'Your cart (2)' })).toBeVisible();

  await drawer.getByPlaceholder('Discount code').fill('NOT-A-REAL-CODE');
  await drawer.getByRole('button', { name: 'Apply' }).click();
  await expect(drawer.getByRole('alert')).toContainText('isn’t valid');
});

test('checkout hands over to Shopify (stops before paying)', async ({ page }) => {
  await page.goto('/products/rich-meal');
  await page.getByRole('button', { name: 'Add to cart', exact: true }).first().click();
  const drawer = page.getByRole('dialog', { name: /Your cart/ });
  await expect(drawer.locator('.line')).toHaveCount(1);

  // catch the navigation to Shopify instead of following it
  const shopify = page.waitForRequest((r) => r.isNavigationRequest() && /(checkout\.avvvs\.com|avvvsglobal\.(com|myshopify\.com))/.test(r.url()));
  await page.route(/(checkout\.avvvs\.com|avvvsglobal\.(com|myshopify\.com))/, (route) => route.fulfill({ status: 200, body: 'checkout reached' }));
  await drawer.getByRole('button', { name: 'Checkout securely' }).click();
  const req = await shopify;
  expect(req.url()).toMatch(/\/(cart\/c|checkouts?)\//);
});

test('search suggests medicines as you type', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  const box = page.getByRole('combobox', { name: 'Search medicines' });
  await box.fill('ashwa');
  await expect(page.locator('.search-opt').first()).toBeVisible();
  await expect(page.locator('.search-body')).toContainText('Ashwagandha');
});

test('A–Z index tolerates spelling variants', async ({ page }) => {
  await page.goto('/medicines');
  await page.getByLabel('Filter medicines by name').fill('dhanvantaram');
  await expect(page.locator('.az li a').first()).toContainText('Dhanwantharam');
});

test('search understands symptoms: "back pain" suggests Pain management and matching medicines', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  await page.getByRole('combobox', { name: 'Search medicines' }).fill('back pain');
  const body = page.locator('.search-body');
  await expect(body.getByText('Shop by concern')).toBeVisible();
  await expect(body.getByRole('option', { name: /Pain management/ })).toBeVisible();
  await expect(body.getByText(/Traditional use: .*back/i).first()).toBeVisible();

  await page.goto('/search?q=hair%20fall');
  await expect(page.getByRole('link', { name: /Shop by concern: Skin & hair/ })).toBeVisible();
  await expect(page.locator('.listing .tile').first()).toBeVisible();
});

test('sold-out medicines point to in-stock ones for similar uses', async ({ page, request }) => {
  // find sold-out products straight from Shopify (stock changes over time)
  const r = await request.post('https://avvvsglobal.myshopify.com/api/2026-10/graphql.json', {
    data: { query: '{ products(first: 250) { nodes { handle availableForSale } } }' },
  });
  const handles: string[] = (await r.json()).data.products.nodes
    .filter((n: { availableForSale: boolean }) => !n.availableForSale).map((n: { handle: string }) => n.handle);
  test.skip(!handles.length, 'nothing is sold out right now');
  let found = false;
  for (const h of handles.slice(0, 6)) {
    await page.goto(`/products/${h}`);
    await expect(page.getByText('Out of stock', { exact: true }).first()).toBeVisible();
    const alt = page.locator('#alternatives');
    if (await alt.count()) {
      await expect(alt.locator('.tile.is-out')).toHaveCount(0);
      await expect(alt.locator('.tile').first()).toBeVisible();
      found = true;
      break;
    }
  }
  expect(found).toBe(true);
});

test('care kits page loads', async ({ page }) => {
  await page.goto('/kits');
  await expect(page.getByRole('heading', { level: 1, name: 'Care kits' })).toBeVisible();
});
