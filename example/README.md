# example

Development playground and living documentation for Solid Upthrust components.

## Overview

This app provides demo pages for every component, served by Vite with hot module replacement. Routes are auto-discovered from `src/pages/*.tsx`.

## Adding a Demo Page

1. Create `src/pages/<ComponentName>.tsx`
2. Add category mapping in `src/router.ts` → `categoryMap` object
3. The page is automatically registered as a route at `/<ComponentName>`

## Categories

| Category | Chinese | Components |
|----------|---------|------------|
| General | 通用 | Button, Icon, Typography |
| Layout | 布局 | Divider, Flex, Grid, Layout, Masonry, Space, Splitter |
| Navigation | 导航 | Anchor, Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs |
| Data Entry | 数据录入 | (future) |
| Data Display | 数据展示 | (future) |
| Feedback | 反馈 | Alert, (future) |

## Demo Page Template

```tsx
import { Component } from 'solid-js'
import { ComponentName } from 'upthrust-ui'

const ComponentNameDemo: Component = () => {
  return (
    <div>
      <h1 class="text-2xl font-bold mb-6">ComponentName</h1>
      
      {/* Basic usage */}
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Basic</h2>
        <ComponentName>Default</ComponentName>
      </section>

      {/* Variants */}
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Variants</h2>
        {/* Show all type/size/state variants */}
      </section>
    </div>
  )
}

export default ComponentNameDemo
```

## Development

```bash
pnpm run dev    # Start at http://localhost:5173
pnpm run build  # Build static site
```
