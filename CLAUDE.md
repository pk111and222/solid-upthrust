# Solid Upthrust - Agent Instructions

## Project Overview

Solid Upthrust (`upthrust-ui`) is a B-end (enterprise/admin) component library for SolidJS, styled with UnoCSS. The visual design follows classic B-end enterprise visual specifications.

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

- **components** (`upthrust-ui`) — Visual UI components. Imports logic from `competence` for complex interactive behaviors. Pure layout/style components (Flex, Grid, Space, Divider, Typography, Icon) do NOT need a competence counterpart. Layout.Sider, Masonry, Splitter, and Anchor DO have competence counterparts (`createSider`, `createMasonry`, `createSplitter`, `createAnchor`) because they carry interactive state (collapse/breakpoint, column distribution, resize math, scroll-spy). Breadcrumb (including its menu dropdown) stays presentational — the Dropdown component owns the interaction.
- **competence** (`upthrust-competence`) — Headless component logic. Exports `create*` composables and type definitions. No JSX, no styles. Only behavior, state management, and accessibility logic. Also exports shared constants consumed by multiple components (e.g., `BREAKPOINTS`).
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

### CVA + UnoCSS Class Scanning Rules (CRITICAL)

UnoCSS uses **static file scanning** to extract class names at build time. It CANNOT extract classes from JavaScript runtime logic (dynamic string concatenation, compound variant evaluation, etc.). Follow these rules strictly:

1. **Every styles.ts file MUST start with `// @unocss-include`** — this tells UnoCSS to scan the file for utility classes.

2. **All color/visual classes MUST appear as string literals inside CVA's `variants` object values** — NOT inside `compoundVariants`. UnoCSS can extract class names from arrays that are direct values of object properties, but it struggles with conditional logic in compoundVariants.

3. **Use merged variant keys instead of compound variants for color combinations.** When a component has a matrix of visual states (e.g., variant × color), merge them into a single variant key:

   ```ts
   // ✅ CORRECT — UnoCSS can scan all classes
   variants: {
     colorScheme: {
       'solid-primary': ["bg-primary", "text-on-primary", "hover:bg-primary/85"],
       'outlined-default': ["bg-surface", "border-outline", "text-on-surface"],
     }
   }

   // ❌ WRONG — UnoCSS cannot extract classes from compoundVariants reliably
   compoundVariants: [
     { variant: "solid", color: "primary", class: ["bg-primary", "text-on-primary"] }
   ]
   ```

4. **Pass boolean props as explicit `true`/`false` to CVA** — never pass `undefined`. CVA variant matching is strict: `disabled: false` will NOT match `undefined`.

   ```ts
   // ✅ CORRECT
   buttonClass({ disabled: !!props.disabled, ghost: props.ghost || false })

   // ❌ WRONG — undefined won't match any variant value
   buttonClass({ disabled: props.disabled })
   ```

5. **Color token class names use kebab-case** — the preset converts Material Design camelCase tokens to kebab-case. Use `text-on-primary` (not `text-onPrimary`), `bg-surface-variant` (not `bg-surfaceVariant`).

6. **compoundVariants are ONLY safe for ghost/disabled overrides** — use them sparingly for `!important` style overrides where the base colorScheme needs to be negated. These typically use `!` prefix classes which UnoCSS handles differently.

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

Do NOT create one for pure presentation/layout components (Flex, Grid, Space, Divider, Typography, Icon).

Existing competence modules: `createSider` (collapse + breakpoint matchMedia, consumed by Layout.Sider), `createMasonry` (responsive column count + sequential/round-robin distribution), `createSplitter` (panel registry, size normalization with sum conservation, min/max clamping, keyboard resize), `createAnchor` (bidirectional scroll-spy with `getScrollContainer`/rAF dependency injection, click-to-scroll suppression, controlled `getCurrentAnchor`; supports both window and inner-container scrolling), `createTrigger` (shared floating-layer mechanics — the rc-trigger subset: portal-ready measured positioning with viewport flip/shift, trigger sequencing for click/hover(+debounce)/contextMenu/focus, outside-click + Escape dismiss, scroll/resize repositioning; consumed by Dropdown and Menu's horizontal popup, intended base for future Popover/Popconfirm/Tooltip), `createSteps` (step state machine with a click-navigation guard — backward moves and single forward step only, never jumping over unfinished steps; imperative next/prev/navigateTo/read raw-signal control flow because the controlled memo lags behind ownedWrite commits; percentOf blends per-step percent into overall 0-100 progress, consumed by Steps), `createMenu` (selected/open keys with controlled overrides, consumed by Menu). `createDropdown` is deprecated in favor of `createTrigger` (kept for compatibility). `BREAKPOINTS` (xs=480, sm=576, md=768, lg=992, xl=1200, xxl=1600, matching the standard breakpoint scale exactly) is exported from competence and shared by Sider (`breakpoint` prop) and Masonry (`columns` responsive keys). `createOwnerCleanup` is exported for components whose ref callbacks run under a null owner (Solid 2 rc).

### Theme Preset (packages/preset)

- Theme tokens use CSS custom properties with `--upthrust` prefix.
- Color system uses Material Design palette via `solid-material-color`.
- **Color keys are auto-converted from camelCase to kebab-case** (e.g., `onPrimary` → `on-primary`). Always use kebab-case in component classes: `text-on-primary`, `bg-primary-container`, `border-outline-variant`.
- Supports light/dark theme switching via `unocss-preset-theme`.
- The preset merges (not overwrites) `preflights`, `rules` from `unocss-preset-theme` — never reassign these arrays directly.
- Shortcuts use `ut` prefix (e.g., `ut-control`, `ut-overlay`).

## Styling Conventions (B-end Visual Alignment)

### Token Usage Rules

| Context | Class | Value |
|---------|-------|-------|
| Default border-radius | `rounded` | 6px |
| Container-level radius (Card, Modal, Dropdown, Alert) | `rounded-lg` | 8px |
| Small element radius | `rounded-sm` | 4px |
| Standard transition | `transition-upthrust` | all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1) |
| Micro-interaction (hover color) | `transition-upthrust-fast` | all 0.1s same easing |
| Elevated overlay (Dropdown, Popover) | `shadow` | standard elevated shadow |
| Default control height | `h-control` | 32px |
| Small control | `h-control-sm` | 24px |
| Large control | `h-control-lg` | 40px |

### Spacing Convention (4px Grid)

| Token | Class | Value |
|-------|-------|-------|
| paddingXXS | `p-xxs` | 4px |
| paddingXS | `p-xs` | 8px |
| paddingSM | `p-sm` | 12px |
| padding | `p-md` | 16px |
| paddingLG | `p-lg` | 24px |
| paddingXL | `p-xl` | 32px |

When the design spec uses a non-standard value (e.g., `5px`), use arbitrary value syntax `py-[5px]`.

### Color Semantic Mapping (MD3 → Visual Role)

| UnoCSS Class | MD3 Token | Visual Equivalent |
|---|---|---|
| `bg-primary` / `text-primary` | primary | colorPrimary |
| `bg-primary-container` | primaryContainer | colorPrimaryBg / hover lighter |
| `text-on-primary` | onPrimary | white text on primary |
| `bg-surface` | surface | colorBgContainer (white) |
| `text-on-surface` | onSurface | colorText (rgba(0,0,0,0.88)) |
| `text-on-surface-variant` | onSurfaceVariant | colorTextSecondary |
| `text-on-surface/25` | — | colorTextDisabled |
| `border-outline` | outline | colorBorder |
| `border-outline-variant` | outlineVariant | colorBorderSecondary |
| `bg-error` / `text-error` | error | colorError |
| `bg-surface-variant` | surfaceVariant | colorFillContent / colorBgLayout |
| `bg-on-surface/4` | — | colorFillQuaternary (subtle hover) |
| `bg-on-surface/6` | — | colorFillTertiary (hover bg) |

### SizeType API Convention

All components use `'small' | 'middle' | 'large'` (matching the standard B-end API). Default is `'middle'`.

Note: some libraries name this size `medium`; this library keeps `middle` for consistency with its existing API. Exceptions to the `'middle'` default: `Space` defaults to `'small'` (8px, matching the standard 8px default gap); `Masonry`'s responsive `columns` accepts only named breakpoint keys (`xs`…`xxl`), not arbitrary px values.

The `split` prop on Space corresponds to the standard `separator` prop (which replaced the deprecated `split`) — keep the `split` name, do not rename.

### Rules Factory (packages/preset)

`packages/preset/src/rules/index.ts` exports `createRules(sizeTokens, styleTokens)` — a factory wired into the preset so `sizeTokens`/`styleTokens` option overrides propagate to utility rules (`h-control`/`h-control-sm`/`h-control-lg`, `transition-upthrust`/`transition-upthrust-fast`/`transition-upthrust-slow`, `duration-*`, `ease-upthrust*`). When adding new token-driven rules, add them inside the factory, not as standalone rule arrays.

## Critical Rules

1. **Every new component or new prop/feature MUST have a corresponding example page** in `example/src/pages/<ComponentName>.tsx`. No exceptions.
2. **Never import third-party UI libraries** — all implementation is from scratch.
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
