# Solid Upthrust - Agent Specification

> This file is the canonical agent instruction set for this repository.
> Compatible with: Claude Code (CLAUDE.md symlink), OpenAI Codex, Cursor, Windsurf, Copilot Workspace, and other AI coding agents.

## Identity

- **Name**: Solid Upthrust / upthrust-ui
- **Type**: SolidJS enterprise (B-end) component library
- **Style System**: UnoCSS (classic B-end enterprise visual language)
- **Monorepo Tool**: pnpm workspace

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
│   └── preset/              # @pkg: upthrust-unocss-preset
│       ├── src/
│       │   ├── index.ts     #   definePreset entry (presetUpthrust)
│       │   ├── theme/       #   Color palettes, spacing tokens, sizes
│       │   ├── rules/       #   Custom UnoCSS rules
│       │   ├── shortcuts.ts #   Component shortcut classes (ut-* prefix)
│       │   ├── safelist.ts  #   Always-included utilities
│       │   └── utils/       #   Helpers (color conversion, sequences)
│       ├── types/
│       └── dist/
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

**Does NOT need competence** (pure layout/presentation):
- Flex, Grid, Space, Divider, Layout, Masonry, Splitter
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

## Constraints & Guardrails

1. **Example required** — Any new component, prop, or feature MUST include an example demo page. PRs without examples should be rejected.
2. **No third-party UI dependency** — Visual design follows the classic B-end enterprise style; never import third-party UI libraries.
3. **UnoCSS only** — No CSS modules, styled-components, or Tailwind CSS (we use preset-wind via UnoCSS).
4. **SolidJS idioms** — `createSignal`, `createMemo`, `createEffect`, `splitProps`, `mergeProps`, `Show`, `For`, `Dynamic`. Never use React hooks or patterns.
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
pnpm run dev::example      # Terminal 4: dev server at localhost:5173

# Build all
pnpm run build
```

## Existing Components

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
