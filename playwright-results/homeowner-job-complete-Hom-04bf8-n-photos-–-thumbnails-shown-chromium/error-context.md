# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homeowner/job-complete.spec.ts >> Homeowner – job lifecycle (mark complete, photos, leave review) >> upload completion photos – thumbnails shown
- Location: e2e/homeowner/job-complete.spec.ts:86:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('img').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('img').first()

```

```yaml
- alert
```

# Test source

```ts
  12  |   });
  13  | 
  14  |   test.afterAll(async () => {
  15  |     await cleanup(db, ids);
  16  |     await db.end();
  17  |   });
  18  | 
  19  |   test('mark job as complete – status changes to completed', async ({ page }) => {
  20  |     const homeowner = await seedHomeowner(db);
  21  |     const contractor = await seedContractor(db);
  22  |     ids.push({ table: 'users', id: homeowner.id });
  23  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  24  |     ids.push({ table: 'users', id: contractor.id });
  25  | 
  26  |     const job = await seedJob(db, homeowner.id, { status: 'awarded' });
  27  |     ids.push({ table: 'jobs', id: job.id });
  28  | 
  29  |     const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
  30  |     ids.push({ table: 'quotes', id: q.id });
  31  | 
  32  |     await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
  33  |     await page.goto(`/cabinet/quote-requests/${job.id}`);
  34  | 
  35  |     await page.getByRole('button', { name: /mark.*(complete|done)|complete/i }).click();
  36  | 
  37  |     await expect(page.locator('main')).toContainText(/completed|work completed/i);
  38  | 
  39  |     const { rows } = await db.query<{ status: string }>(
  40  |       `SELECT status FROM jobs WHERE id = $1`,
  41  |       [job.id],
  42  |     );
  43  |     expect(rows[0].status).toBe('completed');
  44  |   });
  45  | 
  46  |   test('leave a review after completion', async ({ page }) => {
  47  |     const homeowner = await seedHomeowner(db);
  48  |     const contractor = await seedContractor(db);
  49  |     ids.push({ table: 'users', id: homeowner.id });
  50  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  51  |     ids.push({ table: 'users', id: contractor.id });
  52  | 
  53  |     const job = await seedJob(db, homeowner.id, { status: 'completed' });
  54  |     ids.push({ table: 'jobs', id: job.id });
  55  | 
  56  |     const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
  57  |     ids.push({ table: 'quotes', id: q.id });
  58  | 
  59  |     await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
  60  |     await page.goto(`/cabinet/quote-requests/${job.id}`);
  61  | 
  62  |     // Open the review modal
  63  |     await page.getByRole('button', { name: /write a review/i }).click();
  64  | 
  65  |     const reviewText = 'Excellent work, very professional and on time.';
  66  |     await page.getByPlaceholder(/quality.*work|punctuality|communication/i).fill(reviewText);
  67  | 
  68  |     // Star rating – click 4th star
  69  |     const stars = page.locator('[aria-label*="star"]');
  70  |     const starCount = await stars.count();
  71  |     if (starCount >= 4) {
  72  |       await stars.nth(3).click();
  73  |     }
  74  | 
  75  |     await page.getByRole('button', { name: /submit review/i }).click();
  76  | 
  77  |     await expect(page.locator('main')).toContainText(/you reviewed|your review/i);
  78  | 
  79  |     const { rows } = await db.query<{ id: string }>(
  80  |       `SELECT id FROM reviews WHERE job_id = $1 AND homeowner_id = $2`,
  81  |       [job.id, homeowner.id],
  82  |     );
  83  |     expect(rows.length).toBe(1);
  84  |   });
  85  | 
  86  |   test('upload completion photos – thumbnails shown', async ({ page }) => {
  87  |     const homeowner = await seedHomeowner(db);
  88  |     const contractor = await seedContractor(db);
  89  |     ids.push({ table: 'users', id: homeowner.id });
  90  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  91  |     ids.push({ table: 'users', id: contractor.id });
  92  | 
  93  |     const job = await seedJob(db, homeowner.id, { status: 'completed' });
  94  |     ids.push({ table: 'jobs', id: job.id });
  95  | 
  96  |     const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
  97  |     ids.push({ table: 'quotes', id: q.id });
  98  | 
  99  |     await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
  100 |     await page.goto(`/cabinet/quote-requests/${job.id}`);
  101 | 
  102 |     // Switch to photos tab to access the file input
  103 |     await page.getByRole('button', { name: /photos/i }).click();
  104 | 
  105 |     const fileInput = page.locator('input[type="file"]').first();
  106 |     await expect(fileInput).toBeAttached({ timeout: 5_000 });
  107 |     // Use a small test fixture image from Playwright's built-in fixtures
  108 |     await fileInput.setInputFiles([
  109 |       { name: 'photo1.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(1024, 0xff) },
  110 |     ]);
  111 | 
> 112 |     await expect(page.locator('img').first()).toBeVisible({ timeout: 10_000 });
      |                                               ^ Error: expect(locator).toBeVisible() failed
  113 |   });
  114 | });
  115 | 
```