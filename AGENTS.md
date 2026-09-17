# Solid Upthrust - Agent Specification

> This file is the canonical agent instruction set for this repository.
> Compatible with: Claude Code (CLAUDE.md entry point), OpenAI Codex, Cursor, Windsurf, Copilot Workspace, and other AI coding agents.

## AI Entry Workflow (REQUIRED)

> 临时回归任务：接手仓库回归前先读根目录 [TODO.md](TODO.md)，按其中的组件顺序、领取台账与验收要求协作；全部完成并归档后删除该文件和本行。

1. Read this file, then `docs/contributing/ai-workflow.md` before changing code.
2. For tests, read `docs/contributing/testing.md` and `packages/testing/README.md`.
3. For any feature/fix, apply `docs/contributing/feature-checklist.md`; use its
   `templates/feature.md` to map capability IDs to source, demos, docs and tests.
4. For the documentation site, read `docs/README.md` (file routes, SSR/CSR boundaries,
   base paths and static deployment). It uses Solid 2 directly, NOT SolidStart.
5. Inspect the dirty worktree and installed/locked versions. Preserve unrelated edits.
   Never claim skipped/unrun tests, placeholder docs or an undeployed site are complete.

`AGENTS.md` is canonical. `CLAUDE.md` contains additional component history; if its
legacy details conflict with this file, the current source/types and this workflow win.

## Identity

- **Name**: Solid Upthrust / upthrust-ui
- **Type**: SolidJS enterprise (B-end) component library
- **Style System**: UnoCSS (classic B-end enterprise visual language)
- **Monorepo Tool**: pnpm workspace
- **Runtime**: Solid 2 RC (`solid-js` + `@solidjs/web`); exact versions in lockfile. Do not silently upgrade.
- **Release**: wait for Solid 2 stable AND release checks; do not assume a release date.

## Directory Structure

```
solid-upthrust/
├── packages/
│   ├── components/          # @pkg: upthrust-ui
│   │   ├── lib/             #   Component source (one folder per component)
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx    # Component + Props type
│   │   │   │   └── styles.ts   # CVA / UnoCSS class variants
│   │   │   ├── Alert/
│   │   │   ├── Flex/
│   │   │   └── ...
│   │   ├── common/          #   Shared types (SizeType, etc.)
│   │   ├── utils/           #   Shared utilities
│   │   ├── types/           #   Generated .d.ts output
│   │   └── dist/            #   Build output
│   │
│   ├── competence/          # @pkg: upthrust-competence
│   │   ├── src/             #   Headless logic modules
│   │   │   ├── button.ts    #   createButton + ButtonConfig + buttonSplits
│   │   │   ├── alert.ts
│   │   │   ├── steps.ts
│   │   │   ├── pagination.ts
│   │   │   ├── tabs.ts
│   │   │   ├── anchor.ts
│   │   │   ├── dropdown.ts
│   │   │   ├── menu.ts
│   │   │   └── index.ts     #   Barrel re-exports
│   │   ├── types/           #   Generated .d.ts output
│   │   └── dist/            #   Build output
│   │
│   ├── preset/              # @pkg: upthrust-unocss-preset
│   │   ├── src/
│   │   │   ├── index.ts     #   definePreset entry (presetUpthrust)
│   │   │   ├── theme/       #   Color palettes, spacing tokens, sizes
│   │   │   ├── rules/       #   Custom UnoCSS rules
│   │   │   ├── shortcuts.ts #   Component shortcut classes (ut-* prefix)
│   │   │   ├── safelist.ts  #   Always-included utilities
│   │   │   └── utils/       #   Helpers (color conversion, sequences)
│   │   ├── types/
│   │   └── dist/
│
│   └── testing/             # private: upthrust-testing (all executable tests)
│       ├── headless/        # L1: state, logic, preset; docs routing tools
│       ├── smoke/           # L2: basic imports/configuration/mounting
│       ├── render/          # L3: simulated-DOM contracts
│       ├── browser/         # L4: real-browser tests (docs runner exists)
│       └── utils/           # Explicit helpers and fixtures
│
├── docs/                    # private: upthrust-docs (Solid SSR + static output)
│   ├── contributing/       # AI workflow, testing guide, completion checklist
│   ├── src/pages/          # File-based routes; SSR prose and code
│   ├── src/examples/       # Browser-only component demonstrations
│   └── scripts/            # Prerender/build and static preview
│
├── example/                 # Dev playground & demo pages
│   ├── src/
│   │   ├── App.tsx          #   Router shell with sidebar navigation
│   │   ├── router.ts       #   Auto-discovery route config
│   │   ├── Home.tsx         #   Landing page
│   │   └── pages/           #   One .tsx per component demo
│   │       ├── Button.tsx
│   │       ├── Alert.tsx
│   │       ├── Flex.tsx
│   │       └── ...
│   └── package.json
│
├── CLAUDE.md                # Claude Code instructions (points to this file's content)
├── AGENTS.md                # This file — universal agent spec
├── README.md                # Project README
├── tsconfig.json            # Root TS config
├── pnpm-workspace.yaml      # Workspace definition
└── package.json             # Root scripts & shared devDeps
```

## Core Design Principles

### 1. Separation of Concerns: UI vs. Logic

| Layer | Package | Responsibility |
|-------|---------|---------------|
| **UI** | `components` | JSX rendering, UnoCSS styling, props splitting, visual variants |
| **Logic** | `competence` | State machines, event handling, accessibility, keyboard nav |
| **Theme** | `preset` | Design tokens, color palette, spacing scale, shortcuts |

**Rule**: A UI component imports behavior from `competence` via `createXxx()` composable. The competence module never imports from `components`.

### 2. When a Component Needs Headless Logic

**NEEDS competence** (has interactive state):
- Button (loading delay, disabled click prevention)
- Alert (closeable state)
- Steps (current step, status)
- Pagination (page state, page size)
- Tabs (active key, animated switch)
- Anchor (scroll tracking, active link)
- Dropdown (open/close, placement)
- Menu (expand/collapse, selection)
- Layout.Sider, Masonry, Splitter (breakpoint/collapse, distribution, resizing)

**Does NOT need competence** (pure layout/presentation):
- Flex, Grid, Space, Divider, static Layout slots
- Typography, Icon, Breadcrumb

### 3. Styling Approach

- All styles via UnoCSS utility classes — no `.css` files
- Variant composition with `class-variance-authority` (cva)
- Class dedup with `tailwind-merge` (twMerge)
- Dynamic values (gap, flex) use inline `style` object
- Theme tokens via UnoCSS preset shortcuts (`ut-` prefix)
- Icons via `@unocss/preset-icons` + `@iconify-json/mdi`

## How to Add a New Component

### Step 1: Decide if headless logic is needed

If the component has interactive state → create `packages/competence/src/<name>.ts` first.

### Step 2: Create the UI component

```
packages/components/lib/<Name>/
├── index.tsx     # Component + exported props interface
└── styles.ts     # cva-based class composition (optional for simple components)
```

### Step 3: Register exports

- `packages/components/lib/index.ts` — add value + type exports
- `packages/competence/src/index.ts` — add `export * from './<name>'` (if applicable)

### Step 4: Create example page (REQUIRED)

Create `example/src/pages/<Name>.tsx` with representative demos of all props/variants.

### Step 5: Register route category

Add entry to `categoryMap` in `example/src/router.ts`:
```ts
const categoryMap = {
  // ...
  '<Name>': '<Category>', // 通用 | 布局 | 导航 | 数据录入 | 数据展示 | 反馈
}
```

### Step 6: Complete tests and documentation (REQUIRED)

- Keep all tests in `packages/testing`; select applicable L1–L4 checks and document
  why a layer is not applicable. “Not implemented yet” is NOT “not applicable”.
- Add/update `docs/src/pages/` content and `docs/src/examples/` client demonstrations.
  SSR pages use `Demo` IDs and `?raw` source, never execute example imports on the server.
- Follow `docs/contributing/feature-checklist.md`: public types/exports, `example`
  demos, test mapping, docs, relevant builds and evidence are one delivery.

## Constraints & Guardrails

1. **Example required** — Any new component, prop, or feature MUST include an example demo page. PRs without examples should be rejected.
2. **No third-party UI dependency** — Visual design follows the classic B-end enterprise style; never import third-party UI libraries.
3. **UnoCSS only** — No CSS modules, styled-components, or Tailwind CSS (we use preset-wind via UnoCSS).
4. **SolidJS 2 idioms** — use the installed RC APIs (`createSignal`, `createMemo`, `merge`, `omit`, `Show`, `For`; DOM APIs from `@solidjs/web`). JSX import source is `@solidjs/web`; contexts use `<Context value={...}>`. Do not copy Solid 1 `splitProps`/`mergeProps` or React patterns without checking current types.
5. **Tree-shakeable** — Named exports, no top-level side effects (except `import 'uno.css'` in the barrel).
6. **TypeScript strict** — All props interfaces exported, no `any` without justification.
7. **pnpm workspace** — Cross-package references use `workspace:*` protocol.

## Development Workflow

```bash
# Install dependencies
pnpm install

# Development (run watchers + example server)
pnpm run dev::preset       # Terminal 1: watch preset
pnpm run dev::competence   # Terminal 2: watch competence  
pnpm run dev::component    # Terminal 3: watch components
pnpm run dev::example      # Terminal 4: dev server at localhost:5656

# Build production packages + example
pnpm run build

# Independent docs app (does not require production dist builds)
pnpm run dev:docs          # localhost:5657
pnpm run check:docs        # docs typecheck + static SSR build
pnpm run test:docs         # docs unit/DOM contracts
pnpm run test:docs:browser # real static site at root + repository base
```

## Testing

All tests live in the private `packages/testing` workspace; do not add colocated
production-package tests. Its layers are `headless` (L1: state/logic, including
preset tests), `smoke` (L2: basic component usability), `render` (L3: DOM contracts),
and `browser` (L4: real-browser rendering/interaction). Shared helpers and fixtures
belong in `packages/testing/utils`.

Within each layer, group tests directly by material: `<layer>/<Material>/<capability>.test.ts(x)`
(or `.spec.ts` for browser). Use the same PascalCase material name across all four
layers; do not add a `competence`/`components` namespace between the layer and material.
Keep child capabilities with the owning material (e.g. `Form/field.test.ts`,
`DatePicker/range.test.ts`, `Layout/sider.test.ts`). Shared production behaviors live
in `headless/shared/<Module>/`; `preset` and `docs` are reserved infrastructure groups.
Split complex suites by behavior, never by arbitrary line counts; test files must not
import each other. Create an empty layer's material folder with its first real test,
not a placeholder passing test. Existing aggregate files can be split during regression.

Run `pnpm test` for the centralized Vitest suite, or `pnpm run test:headless` /
`pnpm run test:render` for a layer. Root `pnpm run typecheck` includes migrated tests.
Component L2 is still reserved; L4 currently has a documentation-site Playwright
runner, not full component/visual coverage. The browser directory is excluded from
L1–L3 Vitest. See `packages/testing/README.md` for commands and
`docs/contributing/testing.md` for owner/disposal, assertions and coverage rules.
Do not compare JSX return objects in L3; assert DOM contracts. happy-dom cannot
validate actual browser layout or painting. Root typecheck remains a separate gate.

## Selected Existing Components (non-exhaustive; inspect source exports)

### General (通用)
- **Button** — type, size, loading, disabled, ghost, danger, block, shape, icon, href
- **Icon** — name (iconify MDI), size, color, spin
- **Typography** — Text, Title, Paragraph, Link with levels and ellipsis

### Layout (布局)
- **Divider** — horizontal/vertical, dashed, text placement
- **Flex** — direction, wrap, justify, align, gap, inline
- **Grid** — Row/Col system with span, offset, responsive breakpoints
- **Layout** — Header, Footer, Content, Sider shell
- **Masonry** — Waterfall layout with columns
- **Space** — inline spacing with size variants, Compact mode
- **Splitter** — Resizable panels with drag

### Navigation (导航)
- **Anchor** — Scroll-spy navigation links
- **Breadcrumb** — Path-based navigation trail
- **Dropdown** — Trigger-based overlay menu
- **Menu** — Vertical/horizontal navigation menu
- **Pagination** — Page navigation with size changer
- **Steps** — Step-by-step progress indicator
- **Tabs** — Switchable content panels
