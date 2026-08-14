# upthrust-unocss-preset

UnoCSS theme preset for the Solid Upthrust component library.

## Overview

This package provides the design system as a UnoCSS preset: theme color tokens, spacing scale, component shortcuts, custom rules, and light/dark theme switching.

## Structure

```
src/
├── index.ts              # definePreset entry point
├── theme/
│   ├── index.ts          # Theme composition (colors + spacing + style)
│   ├── colors/
│   │   └── material.ts   # Material Design color palette generation
│   ├── gap.ts            # Spacing scale tokens
│   ├── size.ts           # Component size definitions
│   └── style.ts          # Base style tokens
├── rules/
│   └── index.ts          # Custom UnoCSS rules
├── shortcuts.ts          # Component class shortcuts (ut-* prefix)
├── safelist.ts           # Always-generated utilities
└── utils/
    ├── index.ts
    ├── convert.ts        # Color format conversion
    ├── sequence.ts       # Numeric sequences
    └── type.ts           # Type helpers
```

## Usage

```typescript
// uno.config.ts
import { defineConfig } from 'unocss'
import { presetUpthrust } from 'upthrust-unocss-preset'

export default defineConfig({
  presets: [
    presetUpthrust({
      defaultTheme: 'light',          // Default active theme
      shortcutsPrefix: 'ut',          // Component class prefix
      switchedTheme: {                 // Custom theme overrides
        theme: {
          light: { /* color overrides */ },
          dark: { /* color overrides */ },
        }
      }
    }),
  ],
})
```

## Features

### Theme Switching

Built on `unocss-preset-theme` — supports light/dark mode and custom themes. Tokens are exposed as CSS custom properties with `--upthrust` prefix.

### Color System

Based on Material Design palette via `solid-material-color`. Generates full color ramps for semantic colors (primary, success, warning, error, info).

### Spacing Scale

Consistent spacing tokens for gaps, padding, and margins used across all components.

### Component Shortcuts

Pre-defined class combinations for common component patterns:
- `ut-btn` — Button base styles
- `ut-alert` — Alert container styles
- etc.

## Configuration Options

```typescript
interface PresetUpthrustOptions {
  defaultTheme?: string        // Theme to apply by default ('light')
  switchedTheme?: ThemeOption   // Theme definitions for switching
  theme?: Theme                 // UnoCSS Theme overrides
  shortcutsPrefix?: string     // Prefix for shortcuts ('ut')
}
```

## Build

```bash
pnpm run build   # Production build
pnpm run watch   # Development watch mode
```
