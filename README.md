# Shortly — URL Shortener

Phase 1: a responsive, accessible Next.js frontend with a replaceable mock API. No backend, database, cache, extension or deployment configuration is included.

## Run locally

Requires Node.js 22.14+ (Node 24 LTS recommended) and npm.

```sh
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

Open http://localhost:3000. Leave `NEXT_PUBLIC_API_BASE_URL` blank for the browser demo. Restart Next.js after changing environment variables; public environment variables are bundled into the client and must never contain secrets.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start -w @short/web
```

## Workspace

- `apps/web`: App Router page, React Hook Form, Tailwind, TanStack Query mutation, API adapter, isolated browser mock and Vitest/React Testing Library tests.
- `packages/shared`: Zod request/response validation and inferred contracts for future backend reuse.
- `packages/config`: shared strict TypeScript defaults.
- `docs`: architecture decisions and installed dependency versions.

The UI calls `createShortUrl(input)` from `apps/web/src/lib/api.ts`. Setting the public API origin switches it to `POST {origin}/urls`; cross-origin APIs must configure CORS. The JSON request is `{ longUrl, customAlias, expiresAt }`; optional entries are empty strings, and a provided expiration is an ISO UTC timestamp. Success returns `{ id, shortUrl, longUrl, expiresAt }`, with nullable expiration. A 409 signals alias conflict; other non-success responses show a retryable error. Detailed decisions: [architecture decisions](docs/architecture-decisions.md).

## Demo behavior

Mock links persist in localStorage for this origin and browser only. Open uses a local `/s/{alias}` route that checks expiration and redirects. Clearing browser data removes links. Local storage failures surface as API errors. Demo persistence and collision checks are not suitable for concurrent production use. A backend-supplied short URL will work through the same result UI.

## Manual verification

1. Submit an empty form; verify the URL error receives focus.
2. Try `javascript:alert(1)`, `data:text/plain,hello`, `file:///tmp/test`, a malformed URL and embedded credentials; all must fail.
3. Try aliases `api`, `ADMIN`, and `bad alias`; then use `my-link_123`.
4. Choose a past expiration and verify the error; choose a future local time for success.
5. Generate a link; observe disabled loading, success, copy feedback and the open action. Clipboard requires localhost or HTTPS and browser permission.
6. Create the same alias twice to see the API error, then change it and retry.
7. Open the demo link in the same browser, then test a missing or expired alias.
8. Navigate by Tab and Shift+Tab, activate Generate with Enter, and check visible focus and accessible field names.
9. Check layouts at 375px, 768px and desktop widths, including long results and zoom.

Automated tests cover rendering, URL and alias rules, expiration, loading, service errors, success, copy success/failure, keyboard submission, the mock and HTTP adapter. See the phase handoff for actual command results; manual checks are not automated browser verification.

## Next phase

Build the explicitly requested backend phase next: server validation, durable unique aliases, expiration and redirects; then replace the mock via the API base URL. Database, Redis, observability, extension, Playwright browser coverage and infrastructure remain future work. No production availability or latency guarantees are made by this frontend demo.

## Phase 1 verification

Lint, strict type checking, all 23 tests and the production build passed. The built homepage returned HTTP 200. Visual browser checks remain manual. npm audit reports 16 moderate findings in development lint tooling; details and exact versions are in [dependency versions](docs/dependency-versions.md). The full file inventory, results and remaining work are in the [Phase 1 handoff](docs/phase-1.md).
