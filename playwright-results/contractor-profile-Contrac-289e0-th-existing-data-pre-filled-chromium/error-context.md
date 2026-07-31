# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contractor/profile.spec.ts >> Contractor – profile management >> profile page loads with existing data pre-filled
- Location: e2e/contractor/profile.spec.ts:19:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected substring: "Pre-filled Landscaping"
Received string:    "MY PROFILEBusiness nameAbout your business (optional)Your postcodeService radius (miles)You will see homeowner requests within this radius of your postcode.Phone number (optional)Website (optional)Save changes"
Timeout: 15000ms

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('main')
    34 × locator resolved to <main class="flex-1 p-6 md:p-8">…</main>
       - unexpected value "MY PROFILEBusiness nameAbout your business (optional)Your postcodeService radius (miles)You will see homeowner requests within this radius of your postcode.Phone number (optional)Website (optional)Save changes"

```

```yaml
- main:
  - heading "MY PROFILE" [level=2]
  - text: Business name
  - textbox "Business name":
    - /placeholder: e.g. Green Garden Services
    - text: Pre-filled Landscaping
  - text: About your business (optional)
  - textbox "About your business (optional)":
    - /placeholder: Your experience, qualifications, specialities — what a homeowner should know about you before choosing you.
  - text: Your postcode
  - textbox "Your postcode":
    - /placeholder: e.g. SW1A 1AA
    - text: SW1A 1AA
  - text: Service radius (miles)
  - spinbutton "Service radius (miles)": "15"
  - paragraph: You will see homeowner requests within this radius of your postcode.
  - text: Phone number (optional)
  - textbox "Phone number (optional)":
    - /placeholder: +44 7700 900000
  - text: Website (optional)
  - textbox "Website (optional)":
    - /placeholder: https://yourwebsite.com
  - button "Save changes"
```

# Test source

```ts
  1  | import { test, expect } from '../fixtures';
  2  | import { createDbClient, seedContractor, cleanup } from '../fixtures/db';
  3  | import { injectAuth } from '../fixtures/auth';
  4  | import type { Client } from 'pg';
  5  | 
  6  | test.describe('Contractor – profile management', () => {
  7  |   let db: Client;
  8  |   const ids: { table: string; id: string }[] = [];
  9  | 
  10 |   test.beforeAll(async () => {
  11 |     db = await createDbClient();
  12 |   });
  13 | 
  14 |   test.afterAll(async () => {
  15 |     await cleanup(db, ids);
  16 |     await db.end();
  17 |   });
  18 | 
  19 |   test('profile page loads with existing data pre-filled', async ({ page }) => {
  20 |     const contractor = await seedContractor(db, {
  21 |       businessName: 'Pre-filled Landscaping',
  22 |       postcode: 'SW1A 1AA',
  23 |       radiusMiles: 15,
  24 |     });
  25 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  26 |     ids.push({ table: 'users', id: contractor.id });
  27 | 
  28 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  29 |     await page.goto('/cabinet/contractor-profile');
  30 | 
> 31 |     await expect(page.locator('main')).toContainText('Pre-filled Landscaping');
     |                                        ^ Error: expect(locator).toContainText(expected) failed
  32 |     await expect(page.getByLabel(/postcode/i)).toHaveValue(/SW1A 1AA/i);
  33 |   });
  34 | 
  35 |   test('updating business name persists to DB', async ({ page }) => {
  36 |     const contractor = await seedContractor(db, { businessName: 'Old Name Ltd' });
  37 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  38 |     ids.push({ table: 'users', id: contractor.id });
  39 | 
  40 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  41 |     await page.goto('/cabinet/contractor-profile');
  42 | 
  43 |     await page.getByLabel(/business name/i).clear();
  44 |     await page.getByLabel(/business name/i).fill('New Name Ltd');
  45 |     await page.getByRole('button', { name: /save|update/i }).click();
  46 | 
  47 |     await expect(page.locator('main')).toContainText(/saved|updated|success/i);
  48 | 
  49 |     const { rows } = await db.query<{ business_name: string }>(
  50 |       `SELECT business_name FROM contractor_profiles WHERE user_id = $1`,
  51 |       [contractor.id],
  52 |     );
  53 |     expect(rows[0].business_name).toBe('New Name Ltd');
  54 |   });
  55 | 
  56 |   test('invalid postcode shows validation error', async ({ page }) => {
  57 |     const contractor = await seedContractor(db);
  58 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  59 |     ids.push({ table: 'users', id: contractor.id });
  60 | 
  61 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  62 |     await page.goto('/cabinet/contractor-profile');
  63 | 
  64 |     await page.getByLabel(/postcode/i).clear();
  65 |     await page.getByLabel(/postcode/i).fill('INVALID');
  66 |     await page.getByRole('button', { name: /save|update/i }).click();
  67 | 
  68 |     await expect(page.locator('main')).toContainText(/valid.*postcode|postcode.*invalid/i);
  69 |   });
  70 | 
  71 |   test('updating radius persists to DB', async ({ page }) => {
  72 |     const contractor = await seedContractor(db, { radiusMiles: 10 });
  73 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  74 |     ids.push({ table: 'users', id: contractor.id });
  75 | 
  76 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  77 |     await page.goto('/cabinet/contractor-profile');
  78 | 
  79 |     const radiusInput = page.getByLabel(/radius|service area|miles/i).first();
  80 |     await radiusInput.clear();
  81 |     await radiusInput.fill('20');
  82 |     await page.getByRole('button', { name: /save|update/i }).click();
  83 | 
  84 |     await expect(page.locator('main')).toContainText(/saved|updated|success/i);
  85 | 
  86 |     const { rows } = await db.query<{ radius_km: number }>(
  87 |       `SELECT radius_km FROM contractor_profiles WHERE user_id = $1`,
  88 |       [contractor.id],
  89 |     );
  90 |     expect(rows[0].radius_km).toBe(20);
  91 |   });
  92 | });
  93 | 
```