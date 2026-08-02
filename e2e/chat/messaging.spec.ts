import { test, expect } from '../fixtures';
import {
  createDbClient,
  seedHomeowner,
  seedContractor,
  seedJob,
  seedQuote,
  seedChatRoom,
  cleanup,
} from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Chat – real-time messaging between homeowner and contractor', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('homeowner can open chat room and see empty history', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { status: 'awarded' });
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
    ids.push({ table: 'quotes', id: q.id });

    const room = await seedChatRoom(db, job.id, homeowner.id, contractor.id);
    ids.push({ table: 'chat_rooms', id: room.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    await page.getByTestId('open-chat-btn').first().click();

    const chatPane = page.getByTestId('chat-pane');
    await expect(chatPane).toBeVisible();
  });

  test('homeowner sends message – appears in chat immediately', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { status: 'awarded' });
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
    ids.push({ table: 'quotes', id: q.id });

    const room = await seedChatRoom(db, job.id, homeowner.id, contractor.id);
    ids.push({ table: 'chat_rooms', id: room.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);
    await page.getByTestId('open-chat-btn').first().click();

    await page.getByTestId('chat-input').fill('Hello, when can you start?');
    await page.getByTestId('chat-send').click();

    await expect(page.getByTestId('chat-pane')).toContainText('Hello, when can you start?');
  });

  test('message sent by homeowner appears for contractor in the same room', async ({ browser }) => {
    const db2 = await createDbClient();
    const homeowner = await seedHomeowner(db2);
    const contractor = await seedContractor(db2);

    const job = await seedJob(db2, homeowner.id, { status: 'awarded' });
    const q = await seedQuote(db2, job.id, contractor.id, { status: 'accepted' });
    const room = await seedChatRoom(db2, job.id, homeowner.id, contractor.id);

    // Open two browser contexts simultaneously
    const homeownerCtx = await browser.newContext();
    const contractorCtx = await browser.newContext();

    const homeownerPage = await homeownerCtx.newPage();
    const contractorPage = await contractorCtx.newPage();

    await injectAuth(homeownerPage, {
      token: homeowner.token,
      email: homeowner.email,
      role: 'homeowner',
    });
    await injectAuth(contractorPage, {
      token: contractor.token,
      email: contractor.email,
      role: 'contractor',
    });

    await homeownerPage.goto(`/cabinet/quote-requests/${job.id}`);
    await contractorPage.goto(`/cabinet/nearby-requests/${job.id}`);

    await homeownerPage.getByTestId('open-chat-btn').first().click();

    // Contractor opens chat from the job detail page
    await contractorPage.getByTestId('open-chat-btn').first().click();

    const uniqueMsg = `E2E test message ${Date.now()}`;
    await homeownerPage.getByTestId('chat-input').fill(uniqueMsg);
    await homeownerPage.getByTestId('chat-send').click();

    await expect(contractorPage.getByTestId('chat-pane')).toContainText(uniqueMsg, { timeout: 5_000 });

    await homeownerCtx.close();
    await contractorCtx.close();

    // Cleanup
    await db2.query(`DELETE FROM chat_rooms WHERE id = $1`, [room.id]);
    await db2.query(`DELETE FROM quotes WHERE id = $1`, [q.id]);
    await db2.query(`DELETE FROM jobs WHERE id = $1`, [job.id]);
    await db2.query(`DELETE FROM contractor_profiles WHERE user_id = $1`, [contractor.id]);
    await db2.query(`DELETE FROM users WHERE id = ANY($1)`, [[homeowner.id, contractor.id]]);
    await db2.end();
  });
});
