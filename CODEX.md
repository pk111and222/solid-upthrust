This is a SolidJS enterprise (B-end) component library monorepo styled with UnoCSS.
Visual design follows solidjs-upthrust patterns — never import third-party UI libraries directly.

## Packages

- packages/components (upthrust-ui): UI components with JSX + UnoCSS styling
- packages/competence (upthrust-competence): Headless behavior logic (create* composables)
- packages/preset (upthrust-unocss-preset): UnoCSS theme preset (colors, spacing, shortcuts)
- example/: Dev playground with demo pages

## Key Rules

1. Every new component or feature MUST have a demo page in example/src/pages/
2. Components with interactive state import logic from competence via createXxx()
3. Pure layout components (Flex, Grid, Divider, Space, etc.) do NOT need competence
4. All styling through UnoCSS utilities — no CSS files
5. Use SolidJS patterns: createSignal, createMemo, splitProps, mergeProps, Show, For
6. TypeScript strict — export all props interfaces
7. Use pnpm workspace protocol for cross-package references

## Adding a Component

1. (If interactive) Create packages/competence/src/<name>.ts with create<Name>, <Name>Config, <name>Splits
2. Create packages/components/lib/<Name>/index.tsx + optional styles.ts
3. Add exports to packages/components/lib/index.ts
4. Create example/src/pages/<Name>.tsx
5. Add to categoryMap in example/src/router.ts

## Dev Commands

- pnpm run dev::example — start dev server
- pnpm run dev::component — watch components
- pnpm run dev::competence — watch competence
- pnpm run dev::preset — watch preset
