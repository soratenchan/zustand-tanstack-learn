<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project Overview

Japanese-language task management app for learning Zustand + TanStack Query. Single Next.js application with in-memory mock API (no database or external services needed).

### Key Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 3001) |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Tests (watch) | `npm run test:watch` |
| Build | `npm run build` |

### Important Notes

- **Exercise stubs**: Files in `src/stores/` and `src/hooks/` contain placeholder implementations that students fill in. Some tests (ex3, ex5) and the production build will fail until those exercises are completed. This is by design.
- **No `.env` required**: The mock API uses in-memory data in `src/lib/mock-data.ts`. No environment variables or external services are needed.
- **Build type error**: `npm run build` fails with a type error in `task-list.tsx` because the exercise hook stubs return untyped data. The dev server (`npm run dev`) works fine regardless.
- **Solutions**: Reference implementations are in `src/solutions/` for all exercises.
