# /cabinet routes

Authenticated user area. Requires a valid `bloomy_access_token` in localStorage.
The layout (`layout.tsx`) renders a persistent sidebar with links to each section.

Redirects: `/cabinet` → `/cabinet/tile-plans`

## Sections

### `/cabinet/tile-plans`
Manages the user's saved tile plans.
- Lists plans from `GET /api/tile-plans` (sorted by `updatedAt` desc).
- "New plan" → `POST /api/tile-plans` → redirect to `/plan/edit?id=…`.
- "Open" → `/plan/edit?id=<planId>`.
- "Delete" → `DELETE /api/tile-plans/:id`.

### `/cabinet/projects`
Placeholder for future full design projects feature. Currently shows "Coming soon".

## Layout

`layout.tsx` renders:
- Desktop: fixed left sidebar (56-column) with nav links.
- Mobile: top tab bar above the page content.

Active link is highlighted using `pathname.startsWith(item.href)`.
