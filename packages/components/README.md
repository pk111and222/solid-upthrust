# upthrust-ui (components)

UI component package for the Solid Upthrust library.

## Overview

This package contains all visual UI components. Each component is a SolidJS functional component styled with UnoCSS utility classes.

## Structure

```
lib/
├── <ComponentName>/
│   ├── index.tsx      # Component implementation & props type export
│   └── styles.ts      # CVA class variant definitions (optional)
├── index.ts           # Barrel exports
common/
├── type.ts            # Shared types (SizeType, etc.)
utils/
└── ...                # Shared utilities
```

## Design Rules

1. **Import logic from `upthrust-competence`** — for components with interactive behavior, use `createXxx()` composables from the competence package.
2. **Style with UnoCSS only** — use utility classes, compose with `cva()` from `class-variance-authority`, deduplicate with `twMerge`.
3. **Export both component and props** — `export default ComponentName` + `export interface ComponentNameProps`.
4. **Use SolidJS patterns** — `splitProps`, `mergeProps`, `createMemo`, `Show`, `For`, `Dynamic`.

## Adding a Component

1. Create `lib/<Name>/index.tsx` with component and exported props interface
2. (Optional) Create `lib/<Name>/styles.ts` for variant class definitions
3. Add exports to `lib/index.ts`
4. **Required**: Add demo page in `example/src/pages/<Name>.tsx`

## Available Components

| Component | Headless Logic | Category |
|-----------|---------------|----------|
| Button | `createButton` | General |
| Alert | `createAlert` | General |
| Icon | — | General |
| Typography | — | General |
| Divider | — | Layout |
| Flex | — | Layout |
| Grid | — | Layout |
| Layout | — | Layout |
| Masonry | — | Layout |
| Space | — | Layout |
| Splitter | — | Layout |
| Anchor | `createAnchor` | Navigation |
| Breadcrumb | — | Navigation |
| Dropdown | `createTrigger`（旧 `createDropdown` 仅为兼容保留） | Navigation |
| Menu | `createMenu` | Navigation |
| Pagination | `createPagination` | Navigation |
| Steps | `createSteps` | Navigation |
| Tabs | `createTabs` | Navigation |

## Build

```bash
pnpm run build   # Production build
pnpm run watch   # Development watch mode
```
