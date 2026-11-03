# Dependency versions

Direct dependencies pinned from npm stable dist-tags during Phase 1. The lockfile fixes transitive resolution.

| Workspace | Package | Version |
| --- | --- | --- |
| @short/web | `@short/shared` | `*` |
| @short/web | `next` | `16.4.4` |
| @short/web | `react` | `19.3.1` |
| @short/web | `react-dom` | `19.3.1` |
| @short/web | `@tanstack/react-query` | `5.105.3` |
| @short/web | `react-hook-form` | `7.91.0` |
| @short/web | `@hookform/resolvers` | `7.0.1` |
| @short/web | `zod` | `4.6.7` |
| @short/web | `typescript` | `6.0.3` |
| @short/web | `@types/node` | `26.6.6` |
| @short/web | `@types/react` | `19.3.0` |
| @short/web | `@types/react-dom` | `19.3.0` |
| @short/web | `tailwindcss` | `4.3.4` |
| @short/web | `@tailwindcss/postcss` | `4.3.4` |
| @short/web | `eslint` | `9.39.5` |
| @short/web | `eslint-config-next` | `16.4.4` |
| @short/web | `vitest` | `5.1.0` |
| @short/web | `@vitejs/plugin-react` | `6.2.1` |
| @short/web | `jsdom` | `30.1.3` |
| @short/web | `@testing-library/react` | `16.3.3` |
| @short/web | `@testing-library/jest-dom` | `7.0.1` |
| @short/web | `@testing-library/user-event` | `14.6.8` |
| @short/shared | `zod` | `4.6.7` |

## Audit

The install-time npm audit reports 16 moderate findings in development lint dependencies, rooted in minimatch glob complexity (GHSA-g3hv-75wg-m249). No high or critical findings were reported. The suggested automatic fixes downgrade ESLint and Next lint configuration across major versions; these were not applied. Recheck and upgrade compatible upstream tooling as patches become available.

Installed and checked using Node.js 26.7.0 / npm 12.2.1. Supported project minimum: Node.js 22.14. Production runtime is not deployed in this phase.
