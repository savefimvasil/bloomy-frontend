import { Client } from 'pg';
import { createHmac, randomBytes, randomUUID, scryptSync } from 'crypto';

const DB_CONFIG = {
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'bloomy',
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? 'postgres',
};

const JWT_SECRET = process.env.JWT_SECRET ?? 'bloomy-dev-secret';

export async function createDbClient() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  return client;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function generateToken(payload: { sub: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }),
  ).toString('base64url');
  const sig = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export interface SeededUser {
  id: string;
  email: string;
  password: string;
  role: 'homeowner' | 'contractor';
  token: string;
}

export interface SeededJob {
  id: string;
  homeownerId: string;
  projectId: string;
}

export interface SeededQuote {
  id: string;
  jobId: string;
  contractorId: string;
}

export interface SeededChatRoom {
  id: string;
  jobId: string;
  homeownerId: string;
  contractorId: string;
}

export async function seedHomeowner(
  client: Client,
  overrides: Partial<{ email: string; name: string; surname: string; password: string }> = {},
): Promise<SeededUser> {
  const id = randomUUID();
  const email = overrides.email ?? `homeowner-${id.slice(0, 8)}@e2e.test`;
  const password = overrides.password ?? 'TestPass123!';
  const passwordHash = hashPassword(password);

  await client.query(
    `INSERT INTO users (id, name, surname, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, 'homeowner')`,
    [id, overrides.name ?? 'Test', overrides.surname ?? 'Homeowner', email, passwordHash],
  );

  const token = generateToken({ sub: id, email, role: 'homeowner' });
  return { id, email, password, role: 'homeowner', token };
}

export async function seedContractor(
  client: Client,
  overrides: Partial<{
    email: string;
    name: string;
    surname: string;
    password: string;
    businessName: string;
    postcode: string;
    radiusMiles: number;
    lat: number;
    lng: number;
    verified: boolean;
  }> = {},
): Promise<SeededUser & { profileId: string }> {
  const id = randomUUID();
  const profileId = randomUUID();
  const email = overrides.email ?? `contractor-${id.slice(0, 8)}@e2e.test`;
  const password = overrides.password ?? 'TestPass123!';
  const passwordHash = hashPassword(password);

  await client.query(
    `INSERT INTO users (id, name, surname, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, 'contractor')`,
    [id, overrides.name ?? 'Test', overrides.surname ?? 'Contractor', email, passwordHash],
  );

  await client.query(
    `INSERT INTO contractor_profiles
       (id, user_id, business_name, postcode, radius_km, lat, lng, verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      profileId,
      id,
      overrides.businessName ?? 'Test Contracting Ltd',
      overrides.postcode ?? 'SW1A 1AA',
      overrides.radiusMiles ?? 25,
      overrides.lat ?? 51.5014,
      overrides.lng ?? -0.1419,
      overrides.verified ?? false,
    ],
  );

  const token = generateToken({ sub: id, email, role: 'contractor' });
  return { id, email, password, role: 'contractor', token, profileId };
}

export async function seedAdminUser(
  client: Client,
  overrides: Partial<{ email: string; password: string }> = {},
): Promise<SeededUser> {
  const existingEmail = overrides.email ?? process.env.ADMIN_EMAIL ?? 'admin@bloomy.com';
  const existing = await client.query(`SELECT id FROM users WHERE email = $1`, [existingEmail]);
  if (existing.rows.length > 0) {
    const { id } = existing.rows[0] as { id: string };
    const token = generateToken({ sub: id, email: existingEmail, role: 'homeowner' });
    return { id, email: existingEmail, password: '', role: 'homeowner', token };
  }

  const id = randomUUID();
  const password = overrides.password ?? 'Admin123!';
  const passwordHash = hashPassword(password);
  await client.query(
    `INSERT INTO users (id, name, surname, email, password_hash, role)
     VALUES ($1, 'Admin', 'User', $2, $3, 'homeowner')`,
    [id, existingEmail, passwordHash],
  );
  const token = generateToken({ sub: id, email: existingEmail, role: 'homeowner' });
  return { id, email: existingEmail, password, role: 'homeowner', token };
}

export async function seedProject(
  client: Client,
  userId: string,
): Promise<{ id: string }> {
  const id = randomUUID();
  const hash = randomUUID();
  await client.query(
    `INSERT INTO projects (id, user_id, hash) VALUES ($1, $2, $3)`,
    [id, userId, hash],
  );
  return { id };
}

export async function seedJob(
  client: Client,
  homeownerId: string,
  overrides: Partial<{
    title: string;
    postcode: string;
    status: string;
    lat: number;
    lng: number;
    targetContractorId: string;
    note: string;
  }> = {},
): Promise<SeededJob> {
  const id = randomUUID();
  const { id: projectId } = await seedProject(client, homeownerId);

  await client.query(
    `INSERT INTO jobs
       (id, homeowner_id, garden_project_id, title, postcode, status, lat, lng, target_contractor_id, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      homeownerId,
      projectId,
      overrides.title ?? 'E2E Test Job',
      overrides.postcode ?? 'SW1A 1AA',
      overrides.status ?? 'open',
      overrides.lat ?? 51.5014,
      overrides.lng ?? -0.1419,
      overrides.targetContractorId ?? null,
      overrides.note ?? null,
    ],
  );

  return { id, homeownerId, projectId };
}

export async function seedQuote(
  client: Client,
  jobId: string,
  contractorId: string,
  overrides: Partial<{ message: string; priceNote: string; timelineDays: number; status: string }> = {},
): Promise<SeededQuote> {
  const id = randomUUID();
  await client.query(
    `INSERT INTO quotes (id, job_id, contractor_id, message, price_note, timeline_days, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      jobId,
      contractorId,
      overrides.message ?? 'I can do this job professionally.',
      overrides.priceNote ?? '£1,500–£2,000',
      overrides.timelineDays ?? 14,
      overrides.status ?? 'pending',
    ],
  );
  return { id, jobId, contractorId };
}

export async function seedVerificationDocument(
  client: Client,
  contractorUserId: string,
  overrides: Partial<{ type: string; description: string; status: string }> = {},
): Promise<{ id: string }> {
  const id = randomUUID();
  await client.query(
    `INSERT INTO verification_documents (id, contractor_id, type, description, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      id,
      contractorUserId,
      overrides.type ?? 'insurance',
      overrides.description ?? 'Public liability insurance certificate',
      overrides.status ?? 'pending',
    ],
  );
  return { id };
}

export async function seedChatRoom(
  client: Client,
  jobId: string,
  homeownerId: string,
  contractorId: string,
): Promise<SeededChatRoom> {
  const id = randomUUID();
  await client.query(
    `INSERT INTO chat_rooms (id, job_id, homeowner_id, contractor_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (job_id, contractor_id) DO UPDATE SET id = EXCLUDED.id
     RETURNING id`,
    [id, jobId, homeownerId, contractorId],
  );
  return { id, jobId, homeownerId, contractorId };
}

export async function seedNotification(
  client: Client,
  userId: string,
  overrides: Partial<{ type: string; title: string; body: string; link: string; read: boolean }> = {},
): Promise<{ id: string }> {
  const id = randomUUID();
  await client.query(
    `INSERT INTO notifications (id, user_id, type, title, body, link, read)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      userId,
      overrides.type ?? 'proposal_received',
      overrides.title ?? 'New proposal received',
      overrides.body ?? 'A contractor has submitted a proposal.',
      overrides.link ?? null,
      overrides.read ?? false,
    ],
  );
  return { id };
}

const TEST_HOMEOWNER_EMAIL = process.env.TEST_HOMEOWNER_EMAIL ?? 'savefimvasil@gmail.com';
const TEST_CONTRACTOR_EMAIL = process.env.TEST_CONTRACTOR_EMAIL ?? 'contractor@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'foofooF@0';

export async function getTestHomeowner(client: Client): Promise<SeededUser> {
  const { rows } = await client.query<{ id: string; email: string; role: string }>(
    `SELECT id, email, role FROM users WHERE email = $1`,
    [TEST_HOMEOWNER_EMAIL],
  );
  if (!rows.length) throw new Error(`Test homeowner ${TEST_HOMEOWNER_EMAIL} not found in DB`);
  const { id, email, role } = rows[0];
  // Sync the stored hash to TEST_USER_PASSWORD so UI login tests always pass
  await client.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hashPassword(TEST_USER_PASSWORD), id]);
  const token = generateToken({ sub: id, email, role: role as 'homeowner' | 'contractor' });
  return { id, email, password: TEST_USER_PASSWORD, role: 'homeowner', token };
}

export async function getTestContractor(client: Client): Promise<SeededUser & { profileId: string }> {
  const { rows } = await client.query<{ id: string; email: string; role: string; profile_id: string }>(
    `SELECT u.id, u.email, u.role, cp.id as profile_id
     FROM users u
     LEFT JOIN contractor_profiles cp ON cp.user_id = u.id
     WHERE u.email = $1`,
    [TEST_CONTRACTOR_EMAIL],
  );
  if (!rows.length) throw new Error(`Test contractor ${TEST_CONTRACTOR_EMAIL} not found in DB`);
  const { id, email, role, profile_id: profileId } = rows[0];
  const token = generateToken({ sub: id, email, role: role as 'homeowner' | 'contractor' });
  return { id, email, password: TEST_USER_PASSWORD, role: 'contractor', token, profileId: profileId ?? '' };
}

export async function cleanup(client: Client, ids: { table: string; id: string }[]) {
  for (const { table, id } of [...ids].reverse()) {
    await client.query(`DELETE FROM ${table} WHERE id = $1`, [id]).catch(() => {});
  }
}
