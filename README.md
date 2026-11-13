# Dora — Frontend

Next.js 16 (App Router) app of **Dora**, an app for booking courts and shared
spaces in condominiums, with a **BFF** architecture: the browser only talks
to this app. Server Components and the `/api/*` routes call the backend's
**GraphQL** API server to server, sending the `INTERNAL_API_KEY` and the
user's token.

```
Browser ──(httpOnly cookie)──▶ Next.js BFF ──(X-Internal-Api-Key + Bearer, POST /graphql)──▶ NestJS API
```

The UI (texts and URLs) is in Portuguese for the residents; code, comments,
commits and PRs are in English.

## Structure

```
src/
├── app/                    routes (App Router), generated icons and the PWA manifest
├── server/                 BFF — "server-only" (secrets never reach the client bundle)
│   ├── config/env.ts       variables validated with zod
│   ├── graphql/            client.ts (backendGraphql), operations/*, generated/ (codegen)
│   ├── http/               backend errors and the route wrapper (CSRF by origin)
│   ├── auth/session.ts     httpOnly session cookie
│   └── services/           BFF use cases per domain
├── features/               UI modules per domain (components, hooks, api, model)
├── design-system/          tokens + domain-agnostic components
└── shared/                 BFF contracts and pure utilities
```

Lint enforces the layers: `design-system` does not import `features` or
`server`, and feature components do not import `server`.

## Typed GraphQL

1. In the backend: `npm run schema:generate` (writes `src/graphql/schema.gql`).
2. Here: `npm run schema:sync` (copies it to `schema/schema.gql`; accepts
   `BACKEND_DIR`, default `../backend-dora`).
3. Write the operation with `graphql(...)` in `src/server/graphql/operations/`.
4. `npm run codegen`: generates the types in `src/server/graphql/generated/`.
5. Use it with `backendGraphql(document, { variables, token })`. Results and
   variables are typed, and errors become `BackendError` with the backend's
   `code`.

CI fails if the generated types are outdated (`npm run codegen:check`).

## Design system

- Brand: **white, orange and black**. Semantic tokens live in
  `src/app/globals.css` and are exposed to Tailwind v4 via `@theme`.
  Components use intent classes (`bg-surface`, `text-muted`, `bg-brand`),
  never raw colors.
  - `accent` (black): main actions; `brand` (orange `#ff6b1a`): highlights,
    active states and focus — text on orange is always black;
    `brand-ink`: orange text on white (links), readable contrast.
  - `chrome` (near-black): sidebar, drawer and dialog headers.
- Font: Plus Jakarta Sans (`next/font`).
- The mark (orange tile + black "d") is SVG, defined in
  `features/layout/model/brand-mark.ts`; the favicon, app icons and link
  previews are generated from it.
- Signed-in frame: black sidebar on desktop, bottom tab bar on phones.

## Security

- The session lives in an `httpOnly` + `SameSite=Lax` cookie (+ `Secure` in
  production).
- BFF mutation routes reject requests from another origin (CSRF).
- No variable is `NEXT_PUBLIC_`. `INTERNAL_API_KEY` only exists on the server.
- Private app: `robots.txt` blocks everything and no page is indexable.

## Running locally

```bash
npm install
# .env.local lists every variable: BACKEND_URL and INTERNAL_API_KEY (the
# same value as the backend's)
npm run dev                  # http://localhost:3000
```

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run schema:sync` · `npm run codegen`
