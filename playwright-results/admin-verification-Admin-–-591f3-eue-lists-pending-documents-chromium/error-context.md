# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin/verification.spec.ts >> Admin – contractor verification flow >> verification queue lists pending documents
- Location: e2e/admin/verification.spec.ts:34:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected substring: "Pending Verification Ltd"
Received string:    "Verification QueueReview pending contractor verification documents.1 pending documentUnnamed contractorpendingDocument typeinsuranceContractor notePublic liability certificateReview this document"
Timeout: 15000ms

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('main')
    - locator resolved to <main class="min-h-screen bg-canvas">…</main>
    - unexpected value "Verification QueueReview pending contractor verification documents."
    33 × locator resolved to <main class="min-h-screen bg-canvas">…</main>
       - unexpected value "Verification QueueReview pending contractor verification documents.1 pending documentUnnamed contractorpendingDocument typeinsuranceContractor notePublic liability certificateReview this document"

```

```yaml
- main:
  - heading "Verification Queue" [level=1]
  - paragraph: Review pending contractor verification documents.
  - paragraph: 1 pending document
  - text: Unnamed contractor
  - paragraph
  - text: pending
  - paragraph: Document type
  - paragraph: insurance
  - paragraph: Contractor note
  - paragraph: Public liability certificate
  - button "Review this document"
```

# Test source

```ts
  1   | import { test, expect } from '../fixtures';
  2   | import { createDbClient, seedContractor, seedVerificationDocument, cleanup, seedAdminUser } from '../fixtures/db';
  3   | import { generateToken } from '../fixtures/db';
  4   | import { injectAuth } from '../fixtures/auth';
  5   | import type { Client } from 'pg';
  6   | 
  7   | const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@bloomy.com';
  8   | 
  9   | async function getAdminToken(db: Client): Promise<{ token: string; email: string }> {
  10  |   const existing = await db.query<{ id: string }>(
  11  |     `SELECT id FROM users WHERE email = $1 LIMIT 1`,
  12  |     [ADMIN_EMAIL],
  13  |   );
  14  |   const id = existing.rows.length
  15  |     ? existing.rows[0].id
  16  |     : (await seedAdminUser(db, { email: ADMIN_EMAIL })).id;
  17  |   const token = generateToken({ sub: id, email: ADMIN_EMAIL, role: 'homeowner' });
  18  |   return { token, email: ADMIN_EMAIL };
  19  | }
  20  | 
  21  | test.describe('Admin – contractor verification flow', () => {
  22  |   let db: Client;
  23  |   const ids: { table: string; id: string }[] = [];
  24  | 
  25  |   test.beforeAll(async () => {
  26  |     db = await createDbClient();
  27  |   });
  28  | 
  29  |   test.afterAll(async () => {
  30  |     await cleanup(db, ids);
  31  |     await db.end();
  32  |   });
  33  | 
  34  |   test('verification queue lists pending documents', async ({ page }) => {
  35  |     const contractor = await seedContractor(db, {
  36  |       businessName: 'Pending Verification Ltd',
  37  |       verified: false,
  38  |     });
  39  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  40  |     ids.push({ table: 'users', id: contractor.id });
  41  | 
  42  |     const doc = await seedVerificationDocument(db, contractor.id, {
  43  |       type: 'insurance',
  44  |       description: 'Public liability certificate',
  45  |     });
  46  |     ids.push({ table: 'verification_documents', id: doc.id });
  47  | 
  48  |     const admin = await getAdminToken(db);
  49  |     await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
  50  |     await page.goto('/admin/verification');
  51  | 
> 52  |     await expect(page.locator('main')).toContainText('Pending Verification Ltd');
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  53  |   });
  54  | 
  55  |   test('expanding a document card shows document details', async ({ page }) => {
  56  |     const contractor = await seedContractor(db, {
  57  |       businessName: 'Doc Review Contractor',
  58  |       verified: false,
  59  |     });
  60  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  61  |     ids.push({ table: 'users', id: contractor.id });
  62  | 
  63  |     const doc = await seedVerificationDocument(db, contractor.id, {
  64  |       type: 'insurance',
  65  |       description: 'Insurance policy document',
  66  |     });
  67  |     ids.push({ table: 'verification_documents', id: doc.id });
  68  | 
  69  |     const admin = await getAdminToken(db);
  70  |     await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
  71  |     await page.goto('/admin/verification');
  72  | 
  73  |     // Document type is already visible on the card (no click needed to expand)
  74  |     await expect(page.locator('main')).toContainText(/insurance/i);
  75  |     await expect(page.locator('main')).toContainText('Insurance policy document');
  76  |   });
  77  | 
  78  |   test('approving a document removes it from the pending queue', async ({ page }) => {
  79  |     const contractor = await seedContractor(db, {
  80  |       businessName: 'Approve Me Contractor',
  81  |       verified: false,
  82  |     });
  83  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  84  |     ids.push({ table: 'users', id: contractor.id });
  85  | 
  86  |     const doc = await seedVerificationDocument(db, contractor.id, { type: 'dbs' });
  87  |     ids.push({ table: 'verification_documents', id: doc.id });
  88  | 
  89  |     const admin = await getAdminToken(db);
  90  |     await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
  91  |     await page.goto('/admin/verification');
  92  | 
  93  |     // Click "Review this document" to expand the card
  94  |     await page.getByRole('button', { name: /review this document/i }).first().click();
  95  |     await page.getByRole('button', { name: /^Approve$/i }).click();
  96  | 
  97  |     // Card disappears from the queue after approval
  98  |     await expect(page.locator('main')).not.toContainText('Approve Me Contractor', {
  99  |       timeout: 8_000,
  100 |     });
  101 | 
  102 |     const { rows } = await db.query<{ status: string }>(
  103 |       `SELECT status FROM verification_documents WHERE id = $1`,
  104 |       [doc.id],
  105 |     );
  106 |     expect(rows[0].status).toBe('approved');
  107 |   });
  108 | 
  109 |   test('rejecting a document keeps it visible with rejected status', async ({ page }) => {
  110 |     const contractor = await seedContractor(db, {
  111 |       businessName: 'Reject Me Contractor',
  112 |       verified: false,
  113 |     });
  114 |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  115 |     ids.push({ table: 'users', id: contractor.id });
  116 | 
  117 |     const doc = await seedVerificationDocument(db, contractor.id, { type: 'id' });
  118 |     ids.push({ table: 'verification_documents', id: doc.id });
  119 | 
  120 |     const admin = await getAdminToken(db);
  121 |     await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
  122 |     await page.goto('/admin/verification');
  123 | 
  124 |     await page.getByRole('button', { name: /review this document/i }).first().click();
  125 |     await page.getByRole('button', { name: /^Reject$/i }).click();
  126 | 
  127 |     // After rejection, document is removed from the pending list
  128 |     await expect(page.locator('main')).not.toContainText('Reject Me Contractor', {
  129 |       timeout: 8_000,
  130 |     });
  131 | 
  132 |     const { rows } = await db.query<{ status: string }>(
  133 |       `SELECT status FROM verification_documents WHERE id = $1`,
  134 |       [doc.id],
  135 |     );
  136 |     expect(rows[0].status).toBe('rejected');
  137 |   });
  138 | 
  139 |   test('unauthenticated access to /admin/verification redirects to /login', async ({ page }) => {
  140 |     await page.goto('/admin/verification');
  141 |     await expect(page).toHaveURL(/\/login/);
  142 |   });
  143 | });
  144 | 
```