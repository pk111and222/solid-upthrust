# Solid Upthrust (upthrust-ui)

A SolidJS enterprise component library styled with UnoCSS, following Ant Design visual specifications.

## Features

- Built for **SolidJS** — reactive, fine-grained, no virtual DOM overhead
- Styled with **UnoCSS** — atomic CSS, zero-runtime, tree-shakeable styles
- **Headless logic layer** (`competence`) separated from UI layer
- **Themeable** via UnoCSS preset with Material Design color system
- TypeScript-first with full type exports
- pnpm monorepo for modular development

## Packages

| Package | npm name | Description |
|---------|----------|-------------|
| `packages/components` | `upthrust-ui` | Visual UI components |
| `packages/competence` | `upthrust-competence` | Headless component logic |
| `packages/preset` | `upthrust-unocss-preset` | UnoCSS theme preset |
| `example` | — | Development playground |

## Quick Start

```bash
# Install
pnpm add upthrust-ui upthrust-unocss-preset solid-js

# UnoCSS config (uno.config.ts)
import { defineConfig } from 'unocss'
import { presetUpthrust } from 'upthrust-unocss-preset'

export default defineConfig({
  presets: [
    presetUpthrust({
      defaultTheme: 'light',
    }),
  ],
})
```

```tsx
// Usage
import { Button, Alert, Flex } from 'upthrust-ui'

function App() {
  return (
    <Flex gap="middle" vertical>
      <Alert type="info">Welcome to Upthrust UI</Alert>
      <Button type="primary">Get Started</Button>
    </Flex>
  )
}
```

## Development

```bash
# Prerequisites
node >= 14
pnpm >= 8

# Install dependencies
pnpm install

# Start development (run in separate terminals)
pnpm run dev::preset       # Watch preset changes
pnpm run dev::competence   # Watch competence changes
pnpm run dev::component    # Watch component changes
pnpm run dev::example      # Dev server at http://localhost:5173
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   example/                        │
│         (Dev playground & component demos)        │
└─────────────────────┬───────────────────────────┘
                      │ imports
┌─────────────────────▼───────────────────────────┐
│              packages/components                  │
│     (UI layer: JSX + UnoCSS class variants)      │
└──────────┬──────────────────────┬───────────────┘
           │ imports logic        │ imports theme
┌──────────▼──────────┐  ┌───────▼───────────────┐
│ packages/competence  │  │   packages/preset      │
│ (Headless behavior)  │  │ (UnoCSS theme tokens)  │
└─────────────────────┘  └───────────────────────┘
```

## Components

### General
- Button, Icon, Typography (Text / Title / Paragraph / Link)

### Layout
- Divider, Flex, Grid (Row / Col), Layout (Header / Footer / Content / Sider), Masonry, Space (Compact), Splitter (Panel)

### Navigation
- Anchor, Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs

## Contributing

See [AGENTS.md](./AGENTS.md) for the full development specification, coding conventions, and how to add new components.

## License

MIT
