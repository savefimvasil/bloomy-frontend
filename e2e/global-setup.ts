import { createDbClient } from './fixtures/db';

export default async function globalSetup() {
  // Verify the database is reachable. Auth-guard and access-control tests don't
  // need the DB, so we warn here rather than hard-fail, letting those pass even
  // if the DB is down. Tests that call seedHomeowner / seedContractor / etc.
  // will fail individually in their own beforeAll with a clear pg error.
  let client;
  try {
    client = await createDbClient();
    await client.query('SELECT 1');
    console.log('\n✓ Database connection OK\n');
  } catch (err) {
    const host = process.env.PGHOST ?? 'localhost';
    const port = process.env.PGPORT ?? '5432';
    console.warn(err,
      `\n⚠️  Cannot connect to PostgreSQL at ${host}:${port}.` +
        `\n   DB-seeded tests will fail. Start Postgres first:` +
        `\n     cd bloomy-deploy && docker compose up -d postgres\n`,
    );
  } finally {
    await client?.end();
  }
}
