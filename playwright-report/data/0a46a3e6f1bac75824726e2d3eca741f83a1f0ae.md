# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contractor/submit-proposal.spec.ts >> Contractor – submit proposal and manage own proposals >> happy path – submit proposal creates DB row and shows success state
- Location: e2e/contractor/submit-proposal.spec.ts:19:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0
```

# Test source

```ts
  1   | import { test, expect } from '../fixtures';
  2   | import { createDbClient, seedHomeowner, seedContractor, seedJob, cleanup } from '../fixtures/db';
  3   | import { injectAuth } from '../fixtures/auth';
  4   | import type { Client } from 'pg';
  5   | 
  6   | test.describe('Contractor – submit proposal and manage own proposals', () => {
  7   |   let db: Client;
  8   |   const ids: { table: string; id: string }[] = [];
  9   | 
  10  |   test.beforeAll(async () => {
  11  |     db = await createDbClient();
  12  |   });
  13  | 
  14  |   test.afterAll(async () => {
  15  |     await cleanup(db, ids);
  16  |     await db.end();
  17  |   });
  18  | 
  19  |   test('happy path – submit proposal creates DB row and shows success state', async ({ page }) => {
  20  |     const homeowner = await seedHomeowner(db);
  21  |     const contractor = await seedContractor(db, {
  22  |       postcode: 'SW1A 1AA',
  23  |       lat: 51.5014,
  24  |       lng: -0.1419,
  25  |       radiusMiles: 25,
  26  |     });
  27  |     ids.push({ table: 'users', id: homeowner.id });
  28  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  29  |     ids.push({ table: 'users', id: contractor.id });
  30  | 
  31  |     const job = await seedJob(db, homeowner.id, {
  32  |       postcode: 'SW1A 2AA',
  33  |       lat: 51.5014,
  34  |       lng: -0.1404,
  35  |     });
  36  |     ids.push({ table: 'jobs', id: job.id });
  37  | 
  38  |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  39  |     await page.goto(`/cabinet/nearby-requests/${job.id}`);
  40  | 
  41  |     await page.getByLabel(/your message/i).fill(
  42  |       'I have 10 years of experience and can start next week.',
  43  |     );
  44  | 
  45  |     const priceNote = page.getByLabel(/price indication/i).first();
  46  |     if (await priceNote.isVisible()) {
  47  |       await priceNote.fill('£1,200–£1,500');
  48  |     }
  49  | 
  50  |     const timeline = page.getByLabel(/estimated duration/i).first();
  51  |     if (await timeline.isVisible()) {
  52  |       await timeline.fill('14');
  53  |     }
  54  | 
  55  |     await page.getByRole('button', { name: /send proposal/i }).click();
  56  | 
  57  |     await expect(page.locator('main')).toContainText(/your proposal|pending/i);
  58  | 
  59  |     const { rows } = await db.query<{ status: string }>(
  60  |       `SELECT status FROM quotes WHERE job_id = $1 AND contractor_id = $2`,
  61  |       [job.id, contractor.id],
  62  |     );
> 63  |     expect(rows.length).toBe(1);
      |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  64  |     expect(rows[0].status).toBe('pending');
  65  | 
  66  |     // Notification for homeowner
  67  |     const { rows: notifRows } = await db.query<{ id: string }>(
  68  |       `SELECT id FROM notifications WHERE user_id = $1 AND type = 'proposal_received'`,
  69  |       [homeowner.id],
  70  |     );
  71  |     expect(notifRows.length).toBeGreaterThanOrEqual(1);
  72  |     // Cleanup quotes
  73  |     await db.query(`DELETE FROM quotes WHERE job_id = $1 AND contractor_id = $2`, [job.id, contractor.id]);
  74  |   });
  75  | 
  76  |   test('revisiting same job shows already-applied state', async ({ page }) => {
  77  |     const homeowner = await seedHomeowner(db);
  78  |     const contractor = await seedContractor(db, {
  79  |       postcode: 'SW1A 1AA',
  80  |       lat: 51.5014,
  81  |       lng: -0.1419,
  82  |       radiusMiles: 25,
  83  |     });
  84  |     ids.push({ table: 'users', id: homeowner.id });
  85  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  86  |     ids.push({ table: 'users', id: contractor.id });
  87  | 
  88  |     const job = await seedJob(db, homeowner.id, { postcode: 'SW1A 2AA', lat: 51.5014, lng: -0.1404 });
  89  |     ids.push({ table: 'jobs', id: job.id });
  90  | 
  91  |     // Seed an existing proposal via API to simulate having already applied
  92  |     const res = await page.request.post(`/api/quote-requests/nearby/${job.id}/propose`, {
  93  |       headers: {
  94  |         Authorization: `Bearer ${contractor.token}`,
  95  |         'Content-Type': 'application/json',
  96  |       },
  97  |       data: { message: 'Already submitted this proposal.', timelineDays: 7 },
  98  |     });
  99  |     // May succeed (201) or already-applied response
  100 |     expect([200, 201, 409].includes(res.status())).toBeTruthy();
  101 | 
  102 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  103 |     await page.goto(`/cabinet/nearby-requests/${job.id}`);
  104 | 
  105 |     await expect(page.locator('main')).toContainText(/your proposal|pending/i);
  106 |     await db.query(`DELETE FROM quotes WHERE job_id = $1 AND contractor_id = $2`, [job.id, contractor.id]);
  107 |   });
  108 | 
  109 |   test('short message (< 20 chars) fails validation', async ({ page }) => {
  110 |     const homeowner = await seedHomeowner(db);
  111 |     const contractor = await seedContractor(db, {
  112 |       postcode: 'SW1A 1AA',
  113 |       lat: 51.5014,
  114 |       lng: -0.1419,
  115 |       radiusMiles: 25,
  116 |     });
  117 |     ids.push({ table: 'users', id: homeowner.id });
  118 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  119 |     ids.push({ table: 'users', id: contractor.id });
  120 | 
  121 |     const job = await seedJob(db, homeowner.id, { postcode: 'SW1A 2AA', lat: 51.5014, lng: -0.1404 });
  122 |     ids.push({ table: 'jobs', id: job.id });
  123 | 
  124 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  125 |     await page.goto(`/cabinet/nearby-requests/${job.id}`);
  126 | 
  127 |     await page.getByLabel(/your message/i).fill('Too short');
  128 |     await page.getByRole('button', { name: /send proposal/i }).click();
  129 | 
  130 |     await expect(page.locator('main')).toContainText(/at least|minimum|too short|characters/i);
  131 |   });
  132 | 
  133 |   test('My Proposals page lists submitted proposals', async ({ page }) => {
  134 |     const homeowner = await seedHomeowner(db);
  135 |     const contractor = await seedContractor(db, { postcode: 'SW1A 1AA', lat: 51.5014, lng: -0.1419 });
  136 |     ids.push({ table: 'users', id: homeowner.id });
  137 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  138 |     ids.push({ table: 'users', id: contractor.id });
  139 | 
  140 |     const job = await seedJob(db, homeowner.id, { title: 'My Proposal Test Job' });
  141 |     ids.push({ table: 'jobs', id: job.id });
  142 | 
  143 |     const { rows } = await db.query<{ id: string }>(
  144 |       `INSERT INTO quotes (id, job_id, contractor_id, message, status)
  145 |        VALUES (gen_random_uuid(), $1, $2, 'Great proposal message here.', 'pending')
  146 |        RETURNING id`,
  147 |       [job.id, contractor.id],
  148 |     );
  149 |     ids.push({ table: 'quotes', id: rows[0].id });
  150 | 
  151 |     await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
  152 |     await page.goto('/cabinet/my-proposals');
  153 | 
  154 |     await expect(page.locator('main')).toContainText('My Proposal Test Job');
  155 |   });
  156 | });
  157 | 
```