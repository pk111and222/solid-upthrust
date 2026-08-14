# upthrust-competence

Headless component logic for the Solid Upthrust library.

## Overview

This package provides framework-agnostic behavioral logic for interactive components. It exposes `create*` composables built on SolidJS primitives (`createSignal`, `createMemo`, `createEffect`) that manage state, events, and accessibility without rendering any UI.

## Structure

```
src/
├── button.ts       # createButton — loading delay, disabled, click handling
├── alert.ts        # createAlert — closeable state
├── steps.ts        # createSteps — current step tracking, status
├── pagination.ts   # createPagination — page state, page size, jump
├── tabs.ts         # createTabs — active key, add/remove tabs
├── anchor.ts       # createAnchor — scroll spy, active link tracking
├── dropdown.ts     # createDropdown — open/close, placement, trigger
├── menu.ts         # createMenu — expand/collapse, selection, keyboard nav
└── index.ts        # Barrel re-exports
```

## Design Rules

1. **No JSX, no styles** — pure TypeScript logic only.
2. **Export a `create<Name>` function** — returns reactive state and element ref callbacks.
3. **Export a `<name>Splits` array** — lists the config keys for `splitProps` in the UI layer.
4. **Export all types** — `<Name>Config` (input options), `<Name>Ins` (imperative handle).

## Pattern

```typescript
// src/example.ts
import { createSignal, createMemo } from 'solid-js'

export type ExampleConfig = {
  disabled?: boolean
  onChange?: (value: string) => void
}

export type ExampleIns = {
  element: () => HTMLElement | undefined
  focus(): void
}

export const createExample = (config: ExampleConfig = {}) => {
  const [value, setValue] = createSignal('')
  const [el, setEl] = createSignal<HTMLElement>()

  function ref(element: HTMLElement) {
    setEl(element)
  }

  const refs: ExampleIns = {
    element: el,
    focus() { el()?.focus() }
  }

  return { value, setValue, ref, refs }
}

export const exampleSplits: (keyof ExampleConfig)[] = ['disabled', 'onChange']
```

## When to Create a Competence Module

Create one when the component has:
- **Interactive state** — open/close, selection, pagination, active tracking
- **Event handling** — click prevention, keyboard navigation, focus management
- **Timers/delays** — loading delays, debounced actions, auto-close

Do NOT create one for pure layout/presentation components (Flex, Grid, Divider, etc.).

## Build

```bash
pnpm run build   # Production build
pnpm run watch   # Development watch mode
```
