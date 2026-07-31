# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat/messaging.spec.ts >> Chat – real-time messaging between homeowner and contractor >> homeowner sends message – appears in chat immediately
- Location: e2e/chat/messaging.spec.ts:52:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[data-testid="chat-pane"], [role="log"], .chat-messages').first()
Expected substring: "Hello, when can you start?"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('[data-testid="chat-pane"], [role="log"], .chat-messages').first()
    3 × locator resolved to <div data-testid="chat-pane" class="flex-1 overflow-y-auto rounded-xl border border-line bg-paper/95 p-4">…</div>
      - unexpected value "No messages yet. Say hello!"

```

```yaml
- alert
- complementary:
  - paragraph: Cabinet
  - text: Homeowner
  - navigation:
    - link "Dashboard":
      - /url: /cabinet
    - link "Quote Requests":
      - /url: /cabinet/quote-requests
    - link "Projects":
      - /url: /cabinet/projects
    - link "Tile Plans":
      - /url: /cabinet/tile-plans
    - link "Estimates":
      - /url: /cabinet/estimates
    - link "Saved Contractors":
      - /url: /cabinet/saved-contractors
    - link "Notifications":
      - /url: /cabinet/notifications
  - text: homeowner-2d90b8f4@e2e.test
  - button "Log out"
- banner:
  - link "Bloomy Garden":
    - /url: /
    - img "Bloomy Garden": BLOOMY GARDEN
  - navigation:
    - button "Tools"
    - link "Find contractors":
      - /url: /contractors
    - button "Notifications"
    - link "Cabinet":
      - /url: /cabinet
- main:
  - button "All requests"
  - heading "E2E Test Job" [level=1]
  - text: Awarded SW1A 1AA
  - link "Open project →":
    - /url: /projects/422d3c9a-68d4-4d45-bb03-c6d9d1c3801d/plan
  - paragraph: When the contractor has finished, mark the job as complete.
  - button "Mark work done"
  - button "Proposals (1)"
  - button "Photos"
  - button "Chat"
  - text: "Sort by:"
  - button "Newest"
  - button "Rating"
  - button "Price"
  - text: TL
  - paragraph: Test Contracting Ltd
  - text: Accepted
  - paragraph: £15,002,000.00
  - paragraph: 14 days
  - paragraph: I can do this job professionally.
  - paragraph: Contact details
  - paragraph:
    - text: "Email:"
    - link "contractor-518098b4@e2e.test":
      - /url: mailto:contractor-518098b4@e2e.test
  - paragraph: Updated today
  - button "Open chat"
- contentinfo:
  - link "Bloomy Garden":
    - /url: /
    - img "Bloomy Garden": BLOOMY GARDEN
  - paragraph: Plan your garden, estimate materials, connect with local contractors.
  - paragraph: For homeowners
  - list:
    - listitem:
      - link "Plan your garden":
        - /url: /projects/new
    - listitem:
      - link "Tile planner":
        - /url: /tile-plan
    - listitem:
      - link "Find a contractor":
        - /url: /contractors
    - listitem:
      - link "My quote requests":
        - /url: /cabinet/quote-requests
  - paragraph: For contractors
  - list:
    - listitem:
      - link "Direct requests":
        - /url: /cabinet/direct-requests
    - listitem:
      - link "Browse local jobs":
        - /url: /cabinet/nearby-requests
    - listitem:
      - link "Join as a contractor":
        - /url: /register
    - listitem:
      - link "My proposals":
        - /url: /cabinet/my-proposals
    - listitem:
      - link "My reviews":
        - /url: /cabinet/my-reviews
    - listitem:
      - link "My profile":
        - /url: /cabinet/contractor-profile
  - paragraph: Resources
  - list:
    - listitem:
      - link "How it works":
        - /url: /#how-it-works
    - listitem:
      - link "Contractor directory":
        - /url: /contractors
  - paragraph: © 2026 Bloomy Garden
  - link "Terms":
    - /url: /terms
  - link "Privacy":
    - /url: /privacy
  - link "Admin":
    - /url: /admin/heatmap
```

# Test source

```ts
  1   | import { test, expect } from '../fixtures';
  2   | import {
  3   |   createDbClient,
  4   |   seedHomeowner,
  5   |   seedContractor,
  6   |   seedJob,
  7   |   seedQuote,
  8   |   seedChatRoom,
  9   |   cleanup,
  10  | } from '../fixtures/db';
  11  | import { injectAuth } from '../fixtures/auth';
  12  | import type { Client } from 'pg';
  13  | 
  14  | test.describe('Chat – real-time messaging between homeowner and contractor', () => {
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
  27  |   test('homeowner can open chat room and see empty history', async ({ page }) => {
  28  |     const homeowner = await seedHomeowner(db);
  29  |     const contractor = await seedContractor(db);
  30  |     ids.push({ table: 'users', id: homeowner.id });
  31  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  32  |     ids.push({ table: 'users', id: contractor.id });
  33  | 
  34  |     const job = await seedJob(db, homeowner.id, { status: 'awarded' });
  35  |     ids.push({ table: 'jobs', id: job.id });
  36  | 
  37  |     const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
  38  |     ids.push({ table: 'quotes', id: q.id });
  39  | 
  40  |     const room = await seedChatRoom(db, job.id, homeowner.id, contractor.id);
  41  |     ids.push({ table: 'chat_rooms', id: room.id });
  42  | 
  43  |     await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
  44  |     await page.goto(`/cabinet/quote-requests/${job.id}`);
  45  | 
  46  |     await page.getByRole('button', { name: /chat|message|open chat/i }).first().click();
  47  | 
  48  |     const chatPane = page.locator('[data-testid="chat-pane"], [role="log"], .chat-messages').first();
  49  |     await expect(chatPane).toBeVisible();
  50  |   });
  51  | 
  52  |   test('homeowner sends message – appears in chat immediately', async ({ page }) => {
  53  |     const homeowner = await seedHomeowner(db);
  54  |     const contractor = await seedContractor(db);
  55  |     ids.push({ table: 'users', id: homeowner.id });
  56  |     ids.push({ table: 'contractor_profiles', id: contractor.profileId });
  57  |     ids.push({ table: 'users', id: contractor.id });
  58  | 
  59  |     const job = await seedJob(db, homeowner.id, { status: 'awarded' });
  60  |     ids.push({ table: 'jobs', id: job.id });
  61  | 
  62  |     const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
  63  |     ids.push({ table: 'quotes', id: q.id });
  64  | 
  65  |     const room = await seedChatRoom(db, job.id, homeowner.id, contractor.id);
  66  |     ids.push({ table: 'chat_rooms', id: room.id });
  67  | 
  68  |     await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
  69  |     await page.goto(`/cabinet/quote-requests/${job.id}`);
  70  |     await page.getByRole('button', { name: /chat|message|open chat/i }).first().click();
  71  | 
  72  |     const msgInput = page.getByPlaceholder(/type.*message|message.../i).first();
  73  |     await msgInput.fill('Hello, when can you start?');
  74  |     await page.getByRole('button', { name: /send/i }).click();
  75  | 
  76  |     await expect(page.locator('[data-testid="chat-pane"], [role="log"], .chat-messages').first())
> 77  |       .toContainText('Hello, when can you start?');
      |        ^ Error: expect(locator).toContainText(expected) failed
  78  |   });
  79  | 
  80  |   test('message sent by homeowner appears for contractor in the same room', async ({ browser }) => {
  81  |     const db2 = await createDbClient();
  82  |     const homeowner = await seedHomeowner(db2);
  83  |     const contractor = await seedContractor(db2);
  84  | 
  85  |     const job = await seedJob(db2, homeowner.id, { status: 'awarded' });
  86  |     const q = await seedQuote(db2, job.id, contractor.id, { status: 'accepted' });
  87  |     const room = await seedChatRoom(db2, job.id, homeowner.id, contractor.id);
  88  | 
  89  |     // Open two browser contexts simultaneously
  90  |     const homeownerCtx = await browser.newContext();
  91  |     const contractorCtx = await browser.newContext();
  92  | 
  93  |     const homeownerPage = await homeownerCtx.newPage();
  94  |     const contractorPage = await contractorCtx.newPage();
  95  | 
  96  |     await injectAuth(homeownerPage, {
  97  |       token: homeowner.token,
  98  |       email: homeowner.email,
  99  |       role: 'homeowner',
  100 |     });
  101 |     await injectAuth(contractorPage, {
  102 |       token: contractor.token,
  103 |       email: contractor.email,
  104 |       role: 'contractor',
  105 |     });
  106 | 
  107 |     await homeownerPage.goto(`/cabinet/quote-requests/${job.id}`);
  108 |     await contractorPage.goto(`/cabinet/nearby-requests/${job.id}`);
  109 | 
  110 |     await homeownerPage.getByRole('button', { name: /chat|message|open chat/i }).first().click();
  111 | 
  112 |     // Contractor opens chat from the job detail page
  113 |     await contractorPage.getByRole('button', { name: /chat|message|open chat/i }).first().click();
  114 | 
  115 |     const uniqueMsg = `E2E test message ${Date.now()}`;
  116 |     const homeownerInput = homeownerPage.getByPlaceholder(/type.*message|message.../i).first();
  117 |     await homeownerInput.fill(uniqueMsg);
  118 |     await homeownerPage.getByRole('button', { name: /send/i }).click();
  119 | 
  120 |     await expect(
  121 |       contractorPage.locator('[data-testid="chat-pane"], [role="log"], .chat-messages').first(),
  122 |     ).toContainText(uniqueMsg, { timeout: 5_000 });
  123 | 
  124 |     await homeownerCtx.close();
  125 |     await contractorCtx.close();
  126 | 
  127 |     // Cleanup
  128 |     await db2.query(`DELETE FROM chat_rooms WHERE id = $1`, [room.id]);
  129 |     await db2.query(`DELETE FROM quotes WHERE id = $1`, [q.id]);
  130 |     await db2.query(`DELETE FROM jobs WHERE id = $1`, [job.id]);
  131 |     await db2.query(`DELETE FROM contractor_profiles WHERE user_id = $1`, [contractor.id]);
  132 |     await db2.query(`DELETE FROM users WHERE id = ANY($1)`, [[homeowner.id, contractor.id]]);
  133 |     await db2.end();
  134 |   });
  135 | });
  136 | 
```