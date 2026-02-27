---
description: Coding standards and patterns for normandy-1944
alwaysApply: true
---

# Coding Standards

## TypeScript

- Strict mode enabled. No `any` types.
- Explicit return types on exported functions.
- Use `interface` for object shapes, `type` for unions/intersections.

## React

- Functional components only. No class components.
- Hooks for all state management. No external state libraries.
- Components in `src/components/`, one component per file.

## File Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase.tsx` (filename matches export)
- Tests: `tests/<mirror-src-path>/<name>.test.ts`

## i18n

- ALL user-facing strings through `useTranslation()` hook.
- Never hardcode display text in components.
- Locale files in `src/locales/{en,fr}/` as JSON.
- When adding new strings: add to both `en/` and `fr/` locale files.

## Reuse First

- Before creating anything new, search `src/engine/` and `src/components/` for existing utilities.
- Check `src/types/index.ts` for existing type definitions.
- Follow existing patterns in similar files rather than inventing new ones.

## Testing

- Framework: Vitest with happy-dom environment.
- Tests in `tests/` directory, mirroring `src/` structure.
- Run: `npm test` to execute full suite.
- Run: `npx vitest run tests/path/to/test.ts` for a single test file.

## Architecture Boundaries

- Game logic stays in `src/engine/`. No React imports in engine files.
- Components never modify engine state directly — they dispatch through the game loop in `GameScreen.tsx`.
- Scenarios define content, not behavior. Behavior lives in the engine.

## Maintenance

- If you create new directories, patterns, or services, update `docs/PROJECT_MAP.md` before completing the task.
