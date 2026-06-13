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

Auth state is stored in `localStorage` (`bloomy_access_token`, `bloomy_user_email`).  
Components read it in `useEffect` (SSR-safe). A custom `bloomy-auth-changed` window event
is dispatched on login/logout so the header updates immediately without a page reload.
