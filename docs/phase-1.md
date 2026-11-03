# Phase 1 handoff

## Files created

- Root: `package.json`, `package-lock.json`, `.gitignore`, `README.md`.
- Shared: `packages/shared/package.json`, `packages/shared/src/index.ts`, `packages/config/tsconfig.base.json`.
- Web configuration: `apps/web/package.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `.env.example`.
- Web app: `src/app/layout.tsx`, `page.tsx`, `globals.css`, `s/[alias]/page.tsx`.
- Components: `src/components/providers.tsx`, `shortener.tsx`.
- API and mock: `src/lib/api.ts`, `src/mocks/short-urls.ts`.
- Tests: `src/test/setup.ts`, `contracts.test.ts`, `shortener.test.tsx`.
- Documentation: this file, `architecture-decisions.md`, `dependency-versions.md`.

All `src/` paths above are relative to `apps/web`. The repository was empty before implementation.

## Architecture

Shared Zod contracts, a single replaceable creation service and an isolated browser mock keep components independent of backend implementation. React Hook Form owns form state, TanStack Query owns mutations, and local state owns clipboard feedback. No form state is put in the URL. Details are in [architecture decisions](architecture-decisions.md).

## Commands

From the repository root:

```sh
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run start -w @short/web
```

## Actual verification results

- ESLint: passed without warnings after fixes.
- TypeScript: passed.
- Vitest: 2 files, 23 tests passed.
- Next.js production build: passed; homepage statically prerendered and demo alias route dynamic.
- Production startup: successful. Homepage HTTP smoke test returned 200 and contained form and empty-state content. Temporary verification server stopped afterward.
- npm audit: 16 moderate development-tooling findings, no high or critical findings. See [dependency versions](dependency-versions.md).
- No visual browser, screen reader or real clipboard-permission verification was performed. Automated keyboard and clipboard behavior tests run in jsdom, not a full browser.

## Manual checks

Follow the numbered [README checklist](../README.md#manual-verification): unsafe URLs, aliases, expiration, loading, success, copy/open, duplicate errors, demo expiration, keyboard navigation and mobile/desktop widths.

## Remaining work

The next backend phase must supply durable uniqueness, authoritative validation, expiration and server redirects through the documented API contract. Database/cache selection and integration, observability, rate limiting/abuse controls, high availability, extension, browser E2E tests and deployment remain deferred until explicitly requested.
