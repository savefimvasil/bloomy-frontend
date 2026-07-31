# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contractor/direct-requests.spec.ts >> Contractor – direct requests >> clicking a direct request card opens job detail
- Location: e2e/contractor/direct-requests.spec.ts:60:7

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByText('Detailed Direct Job')

```

# Test source

```ts
  1   | import { test, expect } from '../fixtures';
  2   | import {
  3   |   createDbClient,
  4   |   seedHomeowner,
  5   |   seedContractor,
  6   |   seedJob,
  7   |   cleanup,
  8   | } from '../fixtures/db';
  9   | import { injectAuth } from '../fixtures/auth';
  10  | import type { Client } from 'pg';
  11  | 
  12  | // Direct requests are shown in the "Sent directly to you" section of
  13  | // /cabinet/nearby-requests (the /cabinet/direct-requests route just redirects there).
  14  | test.describe('Contractor – direct requests', () => {
  15  |   let db: Client;
  16  |   const ids: { table: string; id: string }[] = [];
  17  | 
  18  |   test.beforeAll(async () => {
  19  |     db = await createDbClient();
  20  |   });
  21  | 
  22  |   test.afterAll(async () => {
  23  |     await cleanup(db, ids);
  24  |     await db.end();
  25  |   });
  26  | 
  27  |   test('/cabinet/direct-requests redirects to /cabinet/nearby-requests', async ({ page }) => {
  28  |     const contractor = await seedContractor(db);
  29  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  30  |     ids.push({ table: 'users', id: contractor.id });
  31  | 
  32  |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  33  |     await page.goto('/cabinet/direct-requests');
  34  |     await page.waitForURL(/\/cabinet\/nearby-requests/, { timeout: 10_000 });
  35  |     expect(page.url()).toMatch(/\/cabinet\/nearby-requests/);
  36  |   });
  37  | 
  38  |   test('direct request appears in "Sent directly to you" section', async ({ page }) => {
  39  |     const homeowner = await seedHomeowner(db);
  40  |     const contractor = await seedContractor(db);
  41  |     ids.push({ table: 'users', id: homeowner.id });
  42  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  43  |     ids.push({ table: 'users', id: contractor.id });
  44  | 
  45  |     const job = await seedJob(db, homeowner.id, {
  46  |       title: 'Direct Tiling Job',
  47  |       targetContractorId: contractor.id,
  48  |       status: 'open',
  49  |     });
  50  |     ids.push({ table: 'jobs', id: job.id });
  51  | 
  52  |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  53  |     await page.goto('/cabinet/nearby-requests');
  54  |     await page.waitForLoadState('networkidle');
  55  | 
  56  |     await expect(page.locator('main')).toContainText('Direct Tiling Job');
  57  |     await expect(page.locator('main')).toContainText(/sent directly to you/i);
  58  |   });
  59  | 
  60  |   test('clicking a direct request card opens job detail', async ({ page }) => {
  61  |     const homeowner = await seedHomeowner(db);
  62  |     const contractor = await seedContractor(db);
  63  |     ids.push({ table: 'users', id: homeowner.id });
  64  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  65  |     ids.push({ table: 'users', id: contractor.id });
  66  | 
  67  |     const job = await seedJob(db, homeowner.id, {
  68  |       title: 'Detailed Direct Job',
  69  |       targetContractorId: contractor.id,
  70  |       note: 'Please call before starting.',
  71  |     });
  72  |     ids.push({ table: 'jobs', id: job.id });
  73  | 
  74  |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  75  |     await page.goto('/cabinet/nearby-requests');
  76  |     await page.waitForLoadState('networkidle');
  77  | 
> 78  |     await page.getByText('Detailed Direct Job').click();
      |                                                 ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  79  |     await expect(page).toHaveURL(new RegExp(`/cabinet/nearby-requests/${job.id}`));
  80  |     await expect(page.locator('main')).toContainText('Please call before starting.');
  81  |   });
  82  | 
  83  |   test('accepting a direct request changes job status to in_progress', async ({ page }) => {
  84  |     const homeowner = await seedHomeowner(db);
  85  |     const contractor = await seedContractor(db);
  86  |     ids.push({ table: 'users', id: homeowner.id });
  87  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  88  |     ids.push({ table: 'users', id: contractor.id });
  89  | 
  90  |     const job = await seedJob(db, homeowner.id, {
  91  |       title: 'Accept Direct Test',
  92  |       targetContractorId: contractor.id,
  93  |       status: 'open',
  94  |     });
  95  |     ids.push({ table: 'jobs', id: job.id });
  96  | 
  97  |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  98  |     await page.goto(`/cabinet/nearby-requests/${job.id}`);
  99  |     await page.waitForLoadState('networkidle');
  100 | 
  101 |     await page.getByRole('button', { name: /accept.*start|start work|accept/i }).first().click();
  102 | 
  103 |     await expect(page.locator('main')).toContainText(/in progress|started|accepted/i, {
  104 |       timeout: 10_000,
  105 |     });
  106 | 
  107 |     const { rows } = await db.query<{ status: string }>(
  108 |       `SELECT status FROM jobs WHERE id = $1`,
  109 |       [job.id],
  110 |     );
  111 |     expect(rows[0].status).toBe('in_progress');
  112 |   });
  113 | });
  114 | 
```