# Architecture decisions

## Phase 1 — frontend

- Use npm workspaces, Next.js App Router, React, strict TypeScript and Tailwind CSS. No backend, database, Redis, extension or deployment files are introduced.
- Defer the Drizzle/Prisma decision until the backend phase.
- Keep Zod request/response schemas and inferred TypeScript contracts in `packages/shared`. Runtime validation protects the UI from malformed responses. Backend must independently validate requests; browser validation is for feedback, not enforcement.
- `createShortUrl(input): Promise<CreateShortUrlResponse>` is the single creation boundary. With a nonempty `NEXT_PUBLIC_API_BASE_URL`, it POSTs JSON to `/urls`, with a 10-second timeout and no automatic retries (a repeated POST could create duplicate links). Empty configuration dynamically selects a browser mock. UI components do not import the creation mock.
- The equivalent mock API uses browser localStorage with simulated latency. Demo links use `/s/{alias}` and a client redirect, expire when opened, and reject duplicate aliases. Storage is local, editable and clearable; links cannot be shared between browsers. This is intentionally not a production redirect service. The future backend returns its own absolute short URL, without component changes. Real redirects must run on the backend for low latency.
- Permit only absolute HTTP(S) destination URLs, reject credentials, cap URLs at 2,048 characters and aliases at 64. Reserved aliases are case insensitive. Alias uniqueness is case sensitive in the demo. The backend must settle its uniqueness policy and add abuse controls. HTTP(S) validation alone does not detect malicious sites; no server-side URL fetching exists in this phase.
- Expiration input uses the user's local timezone and converts to an ISO UTC timestamp before transport. Empty alias/expiration strings mean omitted options in this initial contract; response expiration is nullable.
- React Hook Form owns editable fields and errors; TanStack Query mutations own pending/error/result state; component state owns clipboard feedback. URL state contains only the demo alias route. Do not serialize pasted URLs into query strings or add Redux.
- Use native labels, buttons and links, visible focus indicators, a skip link, field error descriptions, invalid flags, live feedback and responsive layouts. New-tab links include `noopener noreferrer`.
- No external fonts or images are required for rendering/building. Pin direct package versions after registry resolution and commit the npm lockfile for reproducibility. See `docs/dependency-versions.md`.
