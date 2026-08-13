<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bloomy Frontend — Agent Guide

Next.js 16 App Router frontend for [bloomy.garden](https://bloomy.garden). Serves a tile planner,
a landscape contractor marketplace, and a user cabinet. Two user roles: `homeowner` and `contractor`.

## Stack

| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| Framework     | Next.js 16, React 19, App Router              |
| Styling       | Tailwind CSS v4 (utility classes only)        |
| State         | Zustand 5 (`store/`)                          |
| Real-time     | Socket.io client (`store/chat.ts`)            |
| HTTP          | Native `fetch` wrapped by `lib/api.ts`        |
| Font          | Instrument Sans (Google Fonts)                |
| Testing       | Jest (not Vitest — project uses webpack)      |

## Running locally

```bash
npm install
npm run dev
```

Or via the unified dev script from `bloomy-deploy/`:

```bash
cd ../bloomy-deploy && ./run-local.sh
```

## Key env vars

| Variable                    | Notes                                        |
|-----------------------------|----------------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`  | Backend REST base URL (e.g. `http://localhost:3000/api`) |
| `NEXT_PUBLIC_SOCKET_URL`    | Socket.io server root (e.g. `http://localhost:3000`) |

Never read these directly in component code — always use `apiFetch` and `useChatStore`.

## Route map

### `app/(site)/` — public / marketing

| Route                          | Description                                          |
|-------------------------------|------------------------------------------------------|
| `/`                           | Marketing home page                                  |
| `/login`                      | Email + password login                               |
| `/register`                   | Step 1 — email + terms                               |
| `/register/verify`            | Step 2 — 6-digit OTP                                |
| `/register/password`          | Step 3 — set password (stored in sessionStorage)     |
| `/register/role`              | Step 3b — choose homeowner / contractor role         |
| `/register/profile`           | Step 4 — name, surname, reason → account created     |
| `/forgot-password`            | Request password reset email                         |
| `/reset-password`             | Consume reset token, set new password                |
| `/tile-plan`                  | Tile planner entry (new vs. existing)                |
| `/tile-plan/edit`             | Planner canvas (`?type=garden\|indoor`, `?id=<id>`) |
| `/tile-plan/import`           | Import plan from JSON file                           |
| `/tile-plan/promo`            | Marketing page for the tile planner                  |
| `/projects`                   | Garden projects list                                 |
| `/projects/new`               | Create project                                       |
| `/projects/[id]`              | Project detail / dashboard                           |
| `/projects/demo`              | Demo garden project                                  |
| `/terms`                      | Terms of service                                     |
| `/privacy`                    | Privacy policy                                       |

### `app/cabinet/` — authenticated user area

Redirects: `/cabinet` → `/cabinet/tile-plans`

| Route                              | Who sees it            | Description                         |
|------------------------------------|------------------------|-------------------------------------|
| `/cabinet/tile-plans`              | both roles             | Saved tile plans list               |
| `/cabinet/projects`                | both roles             | Garden projects list (cabinet view) |
| `/cabinet/contractor-profile`      | contractor             | Edit profile, skills, postcode      |
| `/cabinet/my-proposals`            | contractor             | Proposals submitted to jobs         |
| `/cabinet/nearby-requests`         | contractor             | Open jobs near the contractor       |
| `/cabinet/quote-requests`          | contractor             | Quote-request inbox                 |
| `/cabinet/direct-requests`         | contractor             | Direct job invitations              |
| `/cabinet/estimates`               | contractor             | Cost estimate tool                  |
| `/cabinet/my-reviews`              | contractor             | Reviews received                    |
| `/cabinet/notifications`           | both roles             | Notification centre                 |
| `/cabinet/saved-contractors`       | homeowner              | Bookmarked contractors              |
| `/cabinet/quote-requests/[id]`     | homeowner              | Job + proposals view                |
| `/cabinet/nearby-requests/[id]`    | contractor             | Job detail + proposal form          |

### `app/contractors/` — public contractor discovery

| Route                     | Description                      |
|---------------------------|----------------------------------|
| `/contractors/[postcode]` | Contractors near a UK postcode   |
| `/contractors/profile`    | Contractor's own public profile   |

### `app/admin/` — internal admin area

| Route                      | Description                         |
|---------------------------|-------------------------------------|
| `/admin/pricing`          | Edit material prices / tool configs |
| `/admin/heatmap`          | Job heatmap visualisation           |
| `/admin/verification`     | Review contractor documents         |

## Authentication

Auth state lives in a **Zustand persisted store** (`store/auth.ts`).

```typescript
import { useAuthStore, getAuthToken, getAuthRole, setAuth, clearAuth } from '@/store/auth';

// Reactive (in components)
const { token, role } = useAuthStore();

// One-off reads (event handlers, effects, server-side-safe)
const token = getAuthToken();
const role  = getAuthRole();   // "homeowner" | "contractor"
```

Key details:
- Persisted to `localStorage` under key `"bloomy-auth"` via Zustand `persist` middleware.
- `skipHydration: true` — never reads localStorage synchronously on module load.
  Call `useAuthStore.persist.rehydrate()` in a `useEffect` on root layout to restore session.
- Role is included in the JWT and stored locally as `UserRole = "homeowner" | "contractor"`.
- On logout: `clearAuth()` clears state and localStorage.
- Do **not** call `localStorage.getItem('bloomy-auth')` or any key directly in component code.

## API requests

All HTTP calls go through `apiFetch` from `lib/api.ts`:

```typescript
import { apiFetch } from '@/lib/api';

const res = await apiFetch('/tile-plans', { method: 'POST', body: { name: 'My plan' } });
```

`apiFetch`:
- Prepends `NEXT_PUBLIC_API_BASE_URL`
- Adds `Authorization: Bearer <token>` automatically
- JSON-encodes body + sets `Content-Type: application/json`
- Returns the raw `Response` — caller checks `res.ok` and calls `res.json()`

Never call `fetch('/api/...')` or `fetch('http://localhost:3000/api/...')` directly.
Never add `Authorization` headers manually in components.

## Zustand stores (`store/`)

| File                      | Manages                                              |
|---------------------------|------------------------------------------------------|
| `store/auth.ts`           | JWT token, email, role — persisted                   |
| `store/chat.ts`           | Socket.io connection, rooms, messages, unread, typing |
| `store/cabinet.ts`        | Cabinet-level UI state (selected tab, etc.)          |
| `store/estimate.ts`       | Cost estimator state                                 |
| `store/notifications.ts`  | Notification list and unread count                   |

## Chat (real-time, `store/chat.ts`)

Socket.io connection to `NEXT_PUBLIC_SOCKET_URL/chat`, JWT in `socket.handshake.auth.token`.

```typescript
import { useChatStore } from '@/store/chat';

const { connect, disconnect, joinRoom, sendMessage, emitTyping, openOrCreateRoom } = useChatStore();

// Lifecycle — call on login / logout
connect();
disconnect();

// Open (or find) the chat room for a job
const roomId = await openOrCreateRoom(jobId, contractorId?/);

// In the chat UI
joinRoom(roomId);
sendMessage(roomId, 'Hello!');
emitTyping(roomId, true);
```

Events received from server: `new_message`, `user_typing`, `exception`.
Each user is also in a personal room (`user:<userId>`) so messages arrive even
without an active `join_room`.

Unread counts per room are kept in `store.unread`. Call `markRead(roomId)` when
the user opens a room. The server also updates read receipts on `join_room`.

## Tile planner package

The planner is a local workspace package: `@bloomy/bloomy-planner`
(source in `packages/planner/`).

In application code:
```typescript
import { PlannerCore, outdoorConfig, indoorConfig } from '@bloomy/bloomy-planner';
```

App-level wrappers that stay in `components/plan/`:
- `PlannerEntry.tsx` — loads plan from API, provides `onSave` / `onRequestExport`
- `ExportModal.tsx` — handles save-to-account vs. download
- `UploadFloorplanButton.tsx` — auth-aware floorplan upload

## Component system (`components/`)

### UI primitives (`components/ui/`)

| Component       | Usage                                                            |
|-----------------|------------------------------------------------------------------|
| `Button`        | Variants: `default` (forest fill), `secondary`, `light`, `outline`, `ghost`, `danger`. Pass `href` to render as `<Link>`. |
| `IconButton`    | Icon-only. Sizes: `sm`, `md`, `lg`. Variants: `bordered`, `ghost`, `round`. |
| `ToggleButton`  | Segmented control / tab toggle. Pass `active` for selected state. |
| `Input`         | Labelled text field with optional hint.                          |
| `Slider`        | Range input. Use for bounded numeric controls (grout gap, etc.). |
| `SplitHighlight`| Two-column auth page layout (image left, form right).            |
| `Toast`         | Floating warning/error inside the planner canvas.                |

Do not write raw `<button>` / `<input>` with custom Tailwind — extend the primitives.

### Feature directories

| Directory               | Contents                                                    |
|-------------------------|-------------------------------------------------------------|
| `components/layout/`    | `SiteHeader`, `SiteFooter`, `ScrollToTop` — global chrome   |
| `components/home/`      | Marketing sections (hero, how-it-works, etc.)               |
| `components/promo/`     | Tile planner marketing page                                  |
| `components/plan/`      | Tile planner editor — canvas, sidebar, modals               |
| `components/chat/`      | Chat UI — `ChatWindow`, `ChatRoomList`, typing indicators   |

## Design system

Colour tokens (Tailwind CSS v4 custom properties):

| Token     | Hex / value              | Role                              |
|-----------|--------------------------|-----------------------------------|
| `forest`  | `#1f4d2c`                | Primary brand dark green          |
| `moss`    | `#2f6b3d`                | Hover / secondary dark green      |
| `leaf`    | `#4da162`                | Accent medium green               |
| `lime`    | `#b7e36f`                | Highlight accent — use sparingly  |
| `sage`    | `#7f947c`                | Neutral green-grey                |
| `canvas`  | `#f3f6ec`                | Page background                   |
| `paper`   | `#fbfdf7`                | Card / panel background           |
| `mist`    | `#e5edd9`                | Dividers / alternating rows       |
| `ink`     | `#1f281d`                | Primary text                      |
| `muted`   | `#60715c`                | Secondary text                    |
| `line`    | `rgba(31,40,29,0.10)`    | Borders                           |
| `danger`  | `#a14537`                | Error / destructive               |

Typography:
- **Instrument Sans** — all text
- Headings: uppercase, tracked, heavy weight
- Labels/tags: `text-[11px] uppercase tracking-[0.22em]`
- No drop shadows on cards — use `border` with `line` token

## Testing

```bash
npm test              # Jest
npm run test:watch    # watch mode
```

The test suite is **Jest** (not Vitest). The project uses webpack, not Vite.
Tests live in `lib/plan/__tests__/`. Cover the `optimal-patterns` calculator logic.

## Things to know

- **App Router only** — no Pages Router. All routes are in `app/`. Read
  `node_modules/next/dist/docs/` for the version-specific API before touching routing.
- **RSC by default** — pages and layouts are Server Components unless they have `"use client"`.
  Add `"use client"` only when you need hooks, browser APIs, or Zustand.
- **Auth pattern** — use `useAuthStore()` / `getAuthToken()` from `@/store/auth`.
  The old `lib/auth.ts` helpers (`setAuth`, `clearAuth`, etc.) are aliases that
  call the store — import `useAuthStore` directly instead.
- **`apiFetch` is mandatory** — it's the only place that adds auth headers and the
  API base URL. Direct `fetch` calls to backend URLs will break in staging/production.
- **Hydration safety** — Zustand auth store uses `skipHydration: true`. Components that
  read auth state on server render will see `null` token and `"homeowner"` role.
  Guard auth-required UI with `useAuthStore(s => s._hasHydrated)` before rendering.
- **Tailwind v4** — custom utility classes may differ from v3 docs. Check the generated
  CSS or `tailwind.config.*` before assuming a utility exists.
- **No arbitrary Tailwind values** beyond what's already established in the codebase.
  If a value isn't a defined token, add it to the design tokens rather than using
  `[#hexvalue]` ad-hoc.
- **Chat rooms** — `joinRoom(roomId)` must be called before `sendMessage` works for
  that room. The socket must also be connected (`connect()` called after login).
- **Role-based UI** — read `role` from `useAuthStore`. Contractor-only routes are in
  `/cabinet/nearby-requests`, `/cabinet/my-proposals`, `/cabinet/contractor-profile`, etc.
  Homeowner-only routes are in `/cabinet/quote-requests`, `/cabinet/saved-contractors`.
- **File naming convention** — component files use PascalCase (`Button.tsx`, `CabinetRow.tsx`).
  Some older files are kebab-case (`button.tsx`, `input.tsx`) — treat those as legacy; all new
  files must use PascalCase. Never mix casing within a feature directory.
- **`"use client"` rules** — add only when the file uses hooks, browser APIs, or Zustand stores.
  Server components (no `"use client"`) run on the server and cannot use state or effects.
  Store files (`store/*.ts`) and custom hooks (`lib/use*.ts`) are always client-only.
- **Shared copy strings** — add user-facing labels, messages, and button text to `lib/copy.ts`
  before using them inline. Import from there rather than duplicating strings across files.
- **Image upload** — use `readImageAsDataUrl` from `lib/imageUpload.ts` for client-side
  image-to-data-URL conversions rather than inlining `FileReader` logic.
- **Cabinet thumbnails** — use `TileThumbnail` / `ProjectThumbnail` from
  `components/ui/cabinet-thumbnails.tsx` in list row slots. Do not inline SVGs in page files.
