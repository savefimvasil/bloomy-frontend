# App directory

Next.js App Router. Each subfolder is a route segment.

| Route               | Description                                                     |
|---------------------|-----------------------------------------------------------------|
| `/`                 | Marketing home page                                             |
| `/login`            | Email + password login form                                     |
| `/register`         | Step 1 of registration — email + terms checkbox                 |
| `/register/verify`  | Step 2 — enter 6-digit OTP sent to email                        |
| `/register/password`| Step 3 — set password (stored in sessionStorage for step 4)     |
| `/register/profile` | Step 4 — name, surname, reason, promo checkbox → account created|
| `/plan`             | Tile planner home — choose new or existing plan                 |
| `/plan/edit`        | The tile planner editor (`?type=garden\|indoor`, `?id=<planId>`)|
| `/plan/import`      | Import a plan from a local JSON file                            |
| `/plan/promo`       | Marketing landing page for the tile planner                     |
| `/cabinet`          | Redirects to `/cabinet/tile-plans`                              |
| `/cabinet/tile-plans` | List, open, create, delete tile plans (auth required)         |
| `/cabinet/projects` | Future: full design projects (placeholder)                      |

## Auth pattern

Auth state is stored in `localStorage` (`bloomy_access_token`, `bloomy_user_email`)
but **never accessed directly from page or component code**. Always go through
the helpers in [`lib/auth.ts`](../lib/auth.ts):

| Helper           | Use case                                                  |
|------------------|-----------------------------------------------------------|
| `getAuthToken()` | One-off read inside an event handler or effect (SSR-safe) |
| `getAuthEmail()` | Same, for the stored email                                |
| `setAuth(t, e)`  | Called after login / register-complete to persist the session and broadcast `bloomy-auth-changed` |
| `clearAuth()`    | Called from "Log out" — clears storage and broadcasts the same event |
| `useAuthToken()` | Reactive hook — re-renders when the token changes         |
| `useAuthEmail()` | Reactive hook — re-renders when the email changes         |
| `useIsLoggedIn()`| Boolean variant of `useAuthToken()`                       |

The hooks initialise with an SSR-safe fallback (`null` / `false`) and update via a
microtask after mount, so they avoid hydration mismatches. Each subscribes to the
custom `bloomy-auth-changed` window event and to native `storage`, so a login or
logout in any tab is reflected immediately.

## API requests

All backend requests go through `apiFetch` from [`lib/api.ts`](../lib/api.ts).
It owns:

- the `NEXT_PUBLIC_API_BASE_URL` prefix,
- adding the `Authorization: Bearer <token>` header when a token exists,
- JSON-encoding the request body and setting `Content-Type` automatically.

```ts
import { apiFetch } from "@/lib/api";

const res = await apiFetch("/tile-plans", { method: "POST", body: { name: "..." } });
```

Never call `fetch("/api/...")` or read `process.env.NEXT_PUBLIC_API_BASE_URL` directly
from a page — that bypasses auth and breaks when the env var changes.
