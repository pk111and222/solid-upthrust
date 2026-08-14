# Solid Upthrust - Agent Instructions

## Project Overview

Solid Upthrust (`upthrust-ui`) is a B-end (enterprise/admin) component library for SolidJS, styled with UnoCSS. The visual design follows Ant Design's patterns and specifications.

## Architecture

This is a **pnpm monorepo** with the following packages:

```
solid-upthrust/
├── packages/
│   ├── components/      # UI components (upthrust-ui)
│   ├── competence/      # Headless logic components (upthrust-competence)
│   └── preset/          # UnoCSS theme preset (upthrust-unocss-preset)
├── example/             # Dev playground & component demos
└── package.json         # Root workspace config
```

### Package Relationships

```
preset (theme tokens, shortcuts, rules)
   ↓
components (UI layer: JSX + UnoCSS classes)
   ↑
competence (headless behavior: signals, event handling, state)
```

- **components** (`upthrust-ui`) — Visual UI components. Imports logic from `competence` for complex interactive behaviors. Pure layout/style components (Flex, Grid, Space, Divider, etc.) do NOT need a competence counterpart.
- **competence** (`upthrust-competence`) — Headless component logic. Exports `create*` composables and type definitions. No JSX, no styles. Only behavior, state management, and accessibility logic.
- **preset** (`upthrust-unocss-preset`) — UnoCSS preset providing theme colors (Material Design palette), spacing tokens, shortcuts, and custom rules. Users can customize themes by passing options.

## Tech Stack

- **Framework**: SolidJS 1.9+
- **Styling**: UnoCSS (preset-wind + custom preset)
- **Build**: Vite (library mode for packages, dev server for example)
- **Package Manager**: pnpm (workspace protocol)
- **Language**: TypeScript (strict, JSX preserve with solid-js import source)

## Development Commands

```bash
# Start dev watchers (run in separate terminals or use root scripts)
pnpm run dev::preset       # Watch preset package
pnpm run dev::competence   # Watch competence package
pnpm run dev::component    # Watch components package
pnpm run dev::example      # Start example dev server (localhost:5173)
```

## Coding Conventions

### Component Structure (packages/components)

Each component lives in `packages/components/lib/<ComponentName>/`:

```
lib/Button/
├── index.tsx     # Component implementation & props export
└── styles.ts     # UnoCSS class composition (using cva or plain objects)
```

- Export the component as `default` and its props type as a named export.
- Register in `lib/index.ts` with both value and type exports.
- Use `class-variance-authority` (cva) for variant-based class composition.
- Use `tailwind-merge` (twMerge) for class deduplication.
- Prefer UnoCSS utility classes; avoid inline styles except for dynamic values.

### Headless Logic (packages/competence)

Each competence module lives in `packages/competence/src/<name>.ts`:

- Export a `create<Name>` function (SolidJS composable pattern).
- Export a `<name>Splits` array for `splitProps` usage in the UI layer.
- Export related TypeScript types (`<Name>Config`, `<Name>Ins`, etc.).
- Register in `src/index.ts` with `export * from './<name>'`.

### When to Create a Competence Module

Create a headless counterpart in `competence` when the component has:
- Interactive state (open/close, selection, pagination, etc.)
- Event handling logic (click, keyboard, focus management)
- Complex derived state or side effects

Do NOT create one for pure presentation/layout components (Flex, Grid, Space, Divider, Typography, Icon, Layout, Masonry, Splitter, Breadcrumb).

### Theme Preset (packages/preset)

- Theme tokens use CSS custom properties with `--upthrust` prefix.
- Color system uses Material Design palette via `solid-material-color`.
- Supports light/dark theme switching via `unocss-preset-theme`.
- Shortcuts use `ut` prefix (e.g., `ut-btn`, `ut-alert`).

## Critical Rules

1. **Every new component or new prop/feature MUST have a corresponding example page** in `example/src/pages/<ComponentName>.tsx`. No exceptions.
2. **Never import Ant Design** — only reference its design patterns visually. All implementation is from scratch.
3. **Styles must use UnoCSS utilities** — no CSS files, no CSS-in-JS, no styled-components.
4. **Components must be tree-shakeable** — named exports, no side effects in module scope.
5. **All props interfaces must be exported** for consumer type safety.
6. **SolidJS patterns only** — use `createSignal`, `createMemo`, `createEffect`, `splitProps`, `mergeProps`. No React patterns.

## Example App

The example app at `example/` serves as both development playground and living documentation. It uses `@solidjs/router` with auto-discovery of pages via `import.meta.glob('./pages/*.tsx')`.

To add a new example page:
1. Create `example/src/pages/<ComponentName>.tsx`
2. Add category mapping in `example/src/router.ts` → `categoryMap`
3. The route is auto-registered

Categories: `通用` (General), `布局` (Layout), `导航` (Navigation), `数据录入` (Data Entry), `数据展示` (Data Display), `反馈` (Feedback)
