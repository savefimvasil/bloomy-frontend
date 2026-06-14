# Components

UI primitives and feature components. Always prefer composing these over writing
new raw `<button>`, `<input>`, etc.

## UI primitives (`components/ui/`)

| Component       | Use case                                                          |
|-----------------|-------------------------------------------------------------------|
| `Button`        | Default action button. Variants: `default`, `secondary`, `light`, `outline`, `ghost`, `danger`. Sizes: `default`, `sm`. Pass `href` to render a `<Link>` instead of `<button>`. |
| `IconButton`    | Square or round icon-only button. Sizes: `sm`, `md`, `lg`. Variants: `bordered`, `ghost`, `round`. Use for zoom controls, modal close, sidebar toggles, hamburgers. |
| `ToggleButton`  | Segmented-control / tab toggle. Pass `active` for selected state. Supports `disabled`. Use for tile-size, layout, pattern, material pickers. |
| `Input`         | Labelled text input with optional hint.                           |
| `Slider`        | Range input styled with `accent-forest`. Use for value-in-a-bounded-range controls (grout gap, opacity, etc.). |
| `SplitHighlight`| Two-column login / register page layout — image on left, form on right. |
| `Toast`         | Floating warning / error message inside the planner canvas.       |

### When to add a new variant vs. a new component

- Visual tweak that fits the same role (different colour, padding) → **new variant** on the existing component.
- Different role (text + icon block, two stacked lines, card with description) → **new component**.

If you find yourself passing 4+ `className` overrides to `Button` to make it look right, the right answer is a new component or variant.

## Feature directories

| Directory          | Contents                                                       |
|--------------------|----------------------------------------------------------------|
| `components/layout/` | `SiteHeader`, `SiteFooter`, `ScrollToTop` — global chrome.  |
| `components/home/` | Marketing-page sections (`HeroSection`, `IntroStrip`, `HowItWorks`, etc.). |
| `components/promo/`| Landing page for the tile planner.                            |
| `components/plan/` | Tile planner editor — canvas, sidebar, controls, modals.      |
| `components/plan/sidebar/` | Sidebar widgets reused between indoor / outdoor variants. |

## Patterns

### Buttons

Use `Button` for actions, `IconButton` for icon-only controls, `ToggleButton`
for selectable choices. Do not write a raw `<button>` with custom Tailwind
classes — extend the existing primitive instead.

### Auth-aware components

Read auth state via `useAuthToken()` / `useIsLoggedIn()` from `@/lib/auth`. Do not
call `localStorage.getItem("bloomy_access_token")` inline.

### Fetching data

Call `apiFetch` from `@/lib/api`. Do not reference `NEXT_PUBLIC_API_BASE_URL` or
add the `Authorization` header manually.
