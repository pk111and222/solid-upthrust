> Required entry: read `AGENTS.md` → `docs/contributing/ai-workflow.md`.
> Tests: `docs/contributing/testing.md`; feature completion: `docs/contributing/feature-checklist.md`.
> All tests belong in `packages/testing`; documentation is in root `docs` (Solid 2 SSR + client-only examples, no SolidStart).
> `AGENTS.md` is canonical; preserve the historical notes below, but resolve conflicts against the current source/types and canonical workflow.

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

- **Framework**: SolidJS 2 RC (exact versions in pnpm-lock.yaml)
- **Styling**: UnoCSS (preset-wind + custom preset)
- **Build**: Vite (library mode for packages, dev server for example)
- **Package Manager**: pnpm (workspace protocol)
- **Language**: TypeScript (strict, JSX preserve with @solidjs/web import source)

## Development Commands

```bash
# Start dev watchers (run in separate terminals or use root scripts)
pnpm run dev::preset       # Watch preset package
pnpm run dev::competence   # Watch competence package
pnpm run dev::component    # Watch components package
pnpm run dev::example      # Start example dev server (localhost:5656)
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

Existing competence modules: `createSider` (collapse + breakpoint matchMedia, consumed by Layout.Sider), `createMasonry` (responsive column count + sequential/round-robin distribution), `createSplitter` (panel registry, size normalization with sum conservation, min/max clamping, keyboard resize), `createAnchor` (bidirectional scroll-spy with `getScrollContainer`/rAF dependency injection, click-to-scroll suppression, controlled `getCurrentAnchor`; supports both window and inner-container scrolling), `createTrigger` (shared floating-layer mechanics — the rc-trigger subset: portal-ready measured positioning with viewport flip via visible-area maximization (rc-align strategy: preferred vs opposite side, ties keep preferred) + horizontal clamp/shift, trigger sequencing for click/hover(+debounce, optional open delay via `hoverOpenDelay`)/contextMenu/focus, outside-click + Escape dismiss, scroll/resize repositioning; optional arrow support via `arrow: true` — widens the gap by `arrowPadding` (default 8) and exposes `trigger.arrow()` ({x, y, side} in layer-local coords, tracks the trigger center, clamped 12px from layer edges for rounded corners) for the UI layer to render the triangle; lazy mounting via `lazyMount` (default true) — the layer DOM renders inside `<Show when={trigger.mounted()}>`, first open flips `mounted`, close schedules destruction after the leave animation (~300ms headroom) + `destroyDelay` (default 1000ms), reopening cancels the pending destroy so quick toggles reuse the live DOM; consumed by Dropdown, Menu's horizontal popup, and Popover directly; createTooltip/createPopconfirm pass `arrow: true` internally), `createTooltip` (thin hover-triggered createTrigger specialization — defaults hover/'top', antd-style mouseEnterDelay/mouseLeaveDelay mapped onto hoverOpenDelay/hoverDelay, consumed by Tooltip), `createPopconfirm` (click-confirmed createTrigger specialization — confirm/cancel intents close the panel, async onConfirm keeps it open with a loading OK button until the promise settles, consumed by Popconfirm), `createSteps` (step state machine with a click-navigation guard — backward moves and single forward step only, never jumping over unfinished steps; imperative next/prev/navigateTo/read raw-signal control flow because the controlled memo lags behind ownedWrite commits; percentOf blends per-step percent into overall 0-100 progress, consumed by Steps), `createMenu` (selected/open keys with controlled overrides, consumed by Menu). `createDropdown` is deprecated in favor of `createTrigger` (kept for compatibility). `BREAKPOINTS` (xs=480, sm=576, md=768, lg=992, xl=1200, xxl=1600, matching the standard breakpoint scale exactly) is exported from competence and shared by Sider (`breakpoint` prop) and Masonry (`columns` responsive keys). `createOwnerCleanup` is exported for components whose ref callbacks run under a null owner (Solid 2 rc). Feedback-component modules: `createMessageManager`/`getMessageManager`/`message` (page-wide SINGLETON notification queue — the only competence module that is NOT per-instance; `open` appends/updates by key, `close` marks closing (renderer plays leave animation then `remove`), all queue mutations go through FUNCTIONAL signal updates because Solid 2 batches writes — reading `items()` after a setter in the same batch returns the stale array and would drop entries; `MessageItem.duration` is stored headless but the timer lives in the renderer; consumed by Message's `MessageProvider` + imperative `message.info/success/warning/error/loading` API), `createNotificationManager`/`getNotificationManager`/`notification` (page-wide SINGLETON like Message but with rc-notification semantics: SIX per-placement queues (topLeft/top/topRight/bottomLeft/bottom/bottomRight, per-placement maxCount default 3), duration in SECONDS (antd parity: 4.5s default, 0/null = never), per-item showProgress/pauseOnHover flags; same-key reopen updates in place and a placement change MOVES the notice between queues; existence checks inside open/update/close read the PENDING signal state (no-op functional write) because memo reads are stale within a batch; consumed by Notification's `NotificationProvider` + imperative `notification.open/info/success/warning/error/destroy/close` API — the notice card's countdown is pause-aware: the renderer banks elapsed ms into `spentMs` across hover pauses via RETURNED effect cleanups), `createCarousel` (slide-index state machine: controlled `current` or internal signal; next/prev with infinite wrap or clamped ends; direction inference for the track animation; `animate` flag for instant goTo jumps; autoplay GATE (`autoplayActive` = enabled && unpaused && >1 slide — the interval itself lives in the renderer); `beforeChange`/`afterChange`; control flow reads a PENDING-state probe (no-op functional write, same pattern as notification) so back-to-back imperative calls don't collapse, while render-facing `current`/`canPrev`/`canNext` read the committed signal — the pending probe MUST never run inside a memo/render (write-during-compute); consumed by Carousel — the machine is AXIS-AGNOSTIC, the `vertical` prop is purely a renderer concern: flex-col track + translateY, up/down chevron arrows at the top/bottom edges, and the dots column on the right edge), `createImage` (load state machine 'loading'→'normal'|'error' — notifyLoaded/notifyError fire from the img's load/error events; a reactive src change resets to loading via a subscribe-free watcher inside the status memo (same pattern as createDialog); `effectiveSrc` paints the fallback on error; preview open state controlled-or-uncontrolled with transform-reset-on-close; preview zoom/rotate arithmetic with scale clamping, consumed by Image), `createDialog` (SHARED state machine for Modal and Drawer — the rc-dialog/rc-drawer core: controlled or uncontrolled `open`; `animatedOpen` lags `open` by one leave-animation so the panel DOM survives the close transition (UI gates its `<Show>` on it and reports completion via `notifyLeaveDone`, with a 300ms belt-and-braces timer); lazy mount + reopen-cancels-destroy so quick toggles reuse the DOM; an async close GATE — `shouldClose(intent)` returning a promise holds the dialog open (`busy`) until it settles, which is how antd's confirmLoading-onOk is expressed; intents ('mask'|'keyboard'|'close'|'ok'|'cancel') all route through `requestClose`; controlled-prop flips are synced inside the `animatedOpen` memo (a subscribe-free watcher, since the headless layer keeps no effects); focus save/restore via `lastActiveElement`; consumed by Modal AND Drawer. Drawer adds the antd PUSH on top via the shared `_dialogStack` (Modal + Drawer one stack, zIndex-keyed, version-signal reactive): when a higher-zIndex dialog opens, each lower drawer is pushed TOWARD the screen center — rc-drawer's exact transforms (right→translateX(-d), left→translateX(+d), top→translateY(+d), bottom→translateY(-d)), default 180px, `push` prop true/false/number — riding the same transform transition; the stack also owns the SINGLE document Escape listener that closes only the TOP-MOST open dialog (per-dialog listeners would close every layer at once); panels span the FULL viewport on their anchored axes — only `max-w-[100vw]`/`max-h-[100vh]` cap the thickness axis), `createSkeleton` (block-list derivation: title/paragraph rows/widths, pure `skeletonBlocks` export), `createProgress` (percent clamping, status derivation, circle arc geometry `circlePath` for the 100×100 viewBox, steps index mapping), `createForm` (headless form engine — the rc-field-form FormStore port to Solid signals: single store signal + immutable setValue with a SYNCHRONOUS `storeRef` mirror because Solid 2 commits signal writes in batches and imperative getters (getFieldValue right after a mutation) must read the pending value; field registry + initEntityValue/registerField with preserve cleanup (removeEvent signal) and prevWithoutPreserves refill at destroy; updateValue pipeline = store write → notifyWatch → dependency cascade (dirty-only validateFields) → onValuesChange → triggerOnFieldsChange; validateFields with allPromiseFinish aggregation, lastValidatePromise reference comparison for outOfDate, validateOnly/recursive/dirty options and trigger-filtered rule runs; submit routes through validateFields then onFinish/onFinishFailed; `watch()` returns a read-only signal seeded via registerWatch with stringify de-dup (ownedWrite — commits fire inside reactive scopes); resetFields uses a resetCount signal + resetScope namePathList so fields filter scoped resets), `createFormField` (field entity — registers EAGERLY in the component body (Solid memos are lazy; an unread memo never runs) and re-registers with a clean slate when the name changes (dual-function createEffect — Solid 2 rc has no `on` helper); touched/dirty/errors/warnings signals with ownedWrite for async writes; validateRules captures the value INSIDE the async body (the value memo lags a same-tick store write), filters rules by triggerName × rule-level validateTrigger, debounces via validateDebounce with a supersede check, and guards results with a validatePromise reference race so stale runs are discarded; onChange marks touched/dirty then dispatches updateValue + validateField for the default 'onChange' trigger), `createFormList` (list rows with the rc keyManager {keys, id} — stable row identities across add/remove/move; reads through getFieldValue (the synchronous mirror) so consecutive operations in one batch compose; operations add(defaultValue?, index?)/remove(index|number[])/move(from, to) with range guards; fields() memo returns {name: index, key: stable} descriptors), `formValidate` (async-validator@4.2.5 adapter — ONE rule per AsyncValidator run, ${var} message templates from rule fields + messageVariables, Chinese defaultValidateMessages (mergeMessages deep-merges overrides), warningOnly rules sort last, validateFirst true=serial / 'parallel'=first-failure-wins / false=all-then-merge, array+defaultField recursion, CODE_LOGIC_ERROR fallback for throwing validators, callback-style validator wrapping, and suppressWarning:true because 4.2.5 rebinds its warning fn at load time so the @rc-component static patch does nothing), `formUtils` (getNamePath/getValue/immutable setValue with container-type-preserving clones/cloneByNamePathList/containsNamePath/matchNamePath/move/defaultGetValueFromEvent escape hatch/NameMap keyed by `type:value` split). The UI layer lives in components: Form (owns or borrows a createForm instance via the `form` prop — internal form is created UNCONDITIONALLY to keep hook order stable; native submit validates first), Form.Item (createFormField + FormItemContext injection — Solid has no cloneElement, so form widgets consume `useFormItem()`: explicit props win, context fills value/onChange/validateStatus/id/disabled/size; required asterisk inferred from rules; help row is min-h-22px to prevent layout jumps), Form.List (createFormList + FormListContext prefixName/getKey composition for nesting), Input (first FormItemControl-conformant widget: value-first onChange contract — Solid convention, NOT the DOM event; defaultGetValueFromEvent remains the escape hatch for event-emitting widgets). `createWatermark` (SVG data-URI tile builder: text escape + percent-encode, gap/rotate/font options). Spin keeps NO headless counterpart — its only logic is a tiny debounced visibility state inlined in the component (delay defers the spinner's appearance; flip-to-false hides immediately).

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

`packages/preset/src/rules/index.ts` exports `createRules(sizeTokens, styleTokens)` — a factory wired into the preset so `sizeTokens`/`styleTokens` option overrides propagate to utility rules (`h-control`/`h-control-sm`/`h-control-lg`, `transition-upthrust`/`transition-upthrust-fast`/`transition-upthrust-slow`, `duration-*`, `ease-upthrust*`, `transition-overlay`/`transition-overlay-stack`). When adding new token-driven rules, add them inside the factory, not as standalone rule arrays.

**Overlay transitions — arbitrary-value lists containing `translate`/`scale` are patched by the preset:** wind4's `transition-[...]` validates every listed property against a whitelist that lacks `translate`/``scale`, so such a list silently generates NO CSS and the class falls back to `transition-property: all` — which also transitions `top`/`left` and makes position-anchored floating layers glide in from their seed coordinates. Two layers of defence: (1) the preset ships an interceptor rule that takes over any `transition-[...]` list naming translate/scale/rotate (validated against an EXTENDED whitelist) so consumers' own arbitrary-value usage works correctly; (2) the library's own components use the preset-owned semantic classes `transition-overlay` (opacity, transform, translate, scale) and `transition-overlay-stack` (adds margin, max-height, padding — notification/message row collapse) instead of arbitrary values. NOTE: the UnoCSS config is evaluated once at vite startup — after editing the preset, the consumer's dev server must be restarted for the new preset dist to load.

## Critical Rules

1. **Every new component or new prop/feature MUST have a corresponding example page** in `example/src/pages/<ComponentName>.tsx`. No exceptions.
2. **Never import third-party UI libraries** — all implementation is from scratch.
3. **Styles must use UnoCSS utilities** — no CSS files, no CSS-in-JS, no styled-components.
4. **Components must be tree-shakeable** — named exports, no side effects in module scope.
5. **All props interfaces must be exported** for consumer type safety.
6. **SolidJS patterns only** — use `createSignal`, `createMemo`, `createEffect`, `omit`, `merge`. No React patterns.

## Example App

The example app at `example/` serves as both development playground and living documentation. It uses `@solidjs/router` with auto-discovery of pages via `import.meta.glob('./pages/*.tsx')`.

To add a new example page:
1. Create `example/src/pages/<ComponentName>.tsx`
2. Add category mapping in `example/src/router.ts` → `categoryMap`
3. The route is auto-registered

Categories: `通用` (General), `布局` (Layout), `导航` (Navigation), `数据录入` (Data Entry), `数据展示` (Data Display), `反馈` (Feedback)
