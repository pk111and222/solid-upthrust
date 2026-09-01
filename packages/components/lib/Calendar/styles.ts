// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Root: the calendar shell. Full = surface block; mini adds the LG radius
// (antd mini keeps the panel's bottom corners rounded).
const calendarRootVariants = cva(
  ["bg-surface", "text-on-surface", "w-full"],
  {
    variants: {
      fullscreen: {
        true: [],
        false: ["rounded-lg", "border", "border-solid", "border-outline-variant"],
      },
    },
    defaultVariants: { fullscreen: true },
  }
)

// Header: selectors left, mode switch right (antd puts both on the end
// side; zh-CN reads naturally left-to-right here).
const calendarHeaderVariants = cva(
  ["flex", "items-center", "justify-end", "gap-[8px]"],
  {
    variants: {
      fullscreen: {
        true: ["py-[12px]"],
        false: ["py-[8px]", "px-[8px]"],
      },
    },
    defaultVariants: { fullscreen: true },
  }
)

// Year / month select trigger: a B-end dropdown button (stand-in for antd's
// Select until the Select material lands). Small size in mini mode.
const calendarSelectVariants = cva(
  [
    "inline-flex", "items-center", "justify-center", "gap-[4px]",
    "border", "border-solid", "border-outline", "bg-surface", "rounded",
    "text-on-surface", "cursor-pointer", "select-none", "outline-none",
    "transition-upthrust-fast",
    "hover:border-primary", "hover:text-primary",
  ],
  {
    variants: {
      size: {
        middle: ["h-[32px]", "px-[8px]", "text-[14px]"],
        small: ["h-[24px]", "px-[6px]", "text-[12px]"],
      },
    },
    defaultVariants: { size: "middle" },
  }
)

// Mode switch segment: two buttons in a joined border group (antd
// Radio.Group stand-in). The active half takes the primary tint.
const calendarModeSwitchVariants = cva(
  ["inline-flex", "border", "border-solid", "border-outline", "rounded", "overflow-hidden"],
  { variants: {}, defaultVariants: {} }
)

const calendarModeButtonVariants = cva(
  [
    "inline-flex", "items-center", "justify-center",
    "bg-surface", "text-on-surface-variant", "cursor-pointer", "select-none",
    "border-none", "outline-none", "transition-upthrust-fast",
  ],
  {
    variants: {
      size: {
        middle: ["h-[30px]", "px-[12px]", "text-[14px]"],
        small: ["h-[22px]", "px-[8px]", "text-[12px]"],
      },
      active: {
        true: ["bg-primary/10", "text-primary", "font-medium"],
        false: ["hover:bg-on-surface/6", "hover:text-on-surface"],
      },
    },
    defaultVariants: { size: "middle", active: false },
  }
)

// Panel: the grid region under the header, separated by a hairline.
const calendarPanelVariants = cva(
  {
    variants: {
      fullscreen: {
        // Full: no panel-level hairline — each full cell already draws its
        // own 2px top border (antd full calendar look); a second line here
        // would double the weekday row's underline.
        true: [],
        false: ["rounded-b-lg", "p-[8px]"],
      },
    },
    defaultVariants: { fullscreen: true },
  }
)

// Weekday header row (and the week-number column header in showWeek).
// EVERYTHING CENTERS: full and mini alike, header and body — the full cell
// is a 120px-wide block whose number sits at px-[8px] left padding, so a
// centered label lands squarely over the visible number area, and mini's
// 24px square is centered in its track by definition.
const calendarWeekdayVariants = cva(
  ["text-on-surface-variant", "select-none", "text-center"],
  {
    variants: {
      fullscreen: {
        true: ["h-[18px]", "leading-[18px]", "text-[12px]"],
        false: ["h-[24px]", "leading-[24px]", "text-[12px]"],
      },
    },
    defaultVariants: { fullscreen: true },
  }
)

// The weekday header row container — MUST stay in lockstep with
// calendarGridVariants' date/date-week templates (the whole alignment
// contract: identical track lists put label N over cell column N).
// `full`/`mini` pair with `date`; the `-week` pair with `date-week`.
const calendarWeekdayRowVariants = cva(
  ["grid", "w-full"],
  {
    variants: {
      layout: {
        "full": ["grid-cols-7"],
        "mini": ["grid-cols-7"],
        "mini-week": ["grid-cols-[40px_repeat(7,minmax(0,1fr))]"],
        "full-week": ["grid-cols-[40px_repeat(7,minmax(0,1fr))]"],
      },
    },
    defaultVariants: { layout: "full" },
  }
)

// Empty first cell of the weekday header when showWeek adds the week column.
const calendarWeekdayRowPlaceholderVariants = cva(
  [],
  { variants: {}, defaultVariants: {} }
)

// The 7×6 (or 3×4) cell grid. The weekday header row (calendarWeekdayRow)
// MUST stay in lockstep with these templates: `date`/`full` are plain
// 7-column grids (NO leading track — the week column only exists in the
// `-week` layouts), `date-week` leads with the 40px week track.
const calendarGridVariants = cva(
  ["grid", "w-full"],
  {
    variants: {
      layout: {
        // Date grids: vertical row spacing only (3px, antd mini rhythm) —
        // NO column gap, the columns must stay continuous so the weekday
        // header shares the exact same track geometry.
        date: ["grid-cols-7", "gap-y-[3px]"],
        "date-week": ["grid-cols-[40px_repeat(7,minmax(0,1fr))]", "gap-y-[3px]"],
        month: ["grid-cols-3", "gap-[8px]", "p-[8px]"],
      },
    },
    defaultVariants: { layout: "date" },
  }
)

// Full-screen date cell: the antd `picker-calendar-date` block — 2px top
// hairline, ~120px tall, content area scrolls. Merged state keys keep every
// visual class a scannable literal. The cell is a centered column (antd's
// number block reads left-padded, but a centered number + content matches
// the centered weekday header so EVERYTHING aligns in one axis).
const calendarFullDateVariants = cva(
  [
    "relative", "mx-[4px]", "pt-[4px]", "px-[8px]", "pb-[2px]",
    "h-[120px]", "overflow-hidden", "cursor-pointer", "select-none",
    "border-t-2", "border-t-solid", "border-t-outline-variant",
    "text-on-surface", "rounded-b-sm",
    "transition-upthrust-fast",
    "flex", "flex-col", "items-center",
  ],
  {
    variants: {
      state: {
        idle: [],
        "prev-next": ["text-on-surface/35"],
        today: ["border-t-primary"],
        "today-prev-next": ["border-t-primary", "text-on-surface/35"],
        selected: ["bg-primary/10"],
        "selected-prev-next": ["bg-primary/10", "text-on-surface/35"],
        disabled: ["cursor-not-allowed", "text-on-surface/25", "hover:bg-transparent"],
      },
    },
    defaultVariants: { state: "idle" },
  }
)

// Full-screen date number (the `picker-calendar-date-value`).
const calendarFullDateValueVariants = cva(
  ["text-[16px]", "leading-[24px]", "transition-upthrust-fast"],
  {
    variants: {
      selected: {
        true: ["text-primary", "font-medium"],
        false: [],
      },
    },
    defaultVariants: { selected: false },
  }
)

// Full-screen custom content slot under the number: full-width column under
// the centered number (the cell is a centered flex-col; the slot itself
// left-aligns its own list content).
const calendarFullDateContentVariants = cva(
  ["w-full", "h-[84px]", "overflow-y-auto", "text-[14px]", "leading-[1.5]", "text-on-surface", "text-left"],
  { variants: {}, defaultVariants: {} }
)

// Mini date cell: 24×24 rounded square, centered number. The square is a
// FIXED width inside a 1fr grid track, so it must justify-center in its
// track (grid items default to stretch/start — a w-[24px] item in a wider
// track parks at the track's left edge, drifting off the centered weekday
// label above it).
const calendarMiniDateVariants = cva(
  [
    "relative", "flex", "items-center", "justify-center",
    "justify-self-center",
    "w-[24px]", "h-[24px]", "rounded-sm", "text-[12px]",
    "cursor-pointer", "select-none", "transition-upthrust-fast",
    "text-on-surface",
  ],
  {
    variants: {
      state: {
        idle: ["hover:bg-on-surface/6"],
        "prev-next": ["text-on-surface/35", "hover:bg-on-surface/6"],
        today: ["ring-1", "ring-primary", "text-primary"],
        "today-prev-next": ["ring-1", "ring-primary", "text-on-surface/35"],
        selected: ["bg-primary", "text-on-primary", "font-medium"],
        "selected-prev-next": ["bg-primary", "text-on-primary", "text-on-surface/35"],
        disabled: ["cursor-not-allowed", "text-on-surface/25", "hover:bg-transparent"],
      },
    },
    defaultVariants: { state: "idle" },
  }
)

// Full-screen month cell (year mode): a wide card with the month name.
// Merged state keys (the date grid's prev-next family collapses here — month
// cells are always in-view).
const calendarFullMonthVariants = cva(
  [
    "flex", "flex-col", "items-center", "justify-center",
    "h-[120px]", "mx-[4px]", "my-[2px]", "rounded",
    "cursor-pointer", "select-none", "transition-upthrust-fast",
    "text-on-surface", "text-[16px]",
  ],
  {
    variants: {
      state: {
        idle: ["hover:bg-on-surface/6"],
        "prev-next": ["hover:bg-on-surface/6"],
        today: ["ring-1", "ring-primary"],
        "today-prev-next": ["ring-1", "ring-primary"],
        selected: ["bg-primary/10", "text-primary", "font-medium"],
        "selected-prev-next": ["bg-primary/10"],
        disabled: ["cursor-not-allowed", "text-on-surface/25", "hover:bg-transparent"],
      },
    },
    defaultVariants: { state: "idle" },
  }
)

// Mini month cell: 3 columns of short wide pills.
const calendarMiniMonthVariants = cva(
  [
    "flex", "items-center", "justify-center",
    "h-[40px]", "rounded", "text-[13px]",
    "cursor-pointer", "select-none", "transition-upthrust-fast",
    "text-on-surface",
  ],
  {
    variants: {
      state: {
        idle: ["hover:bg-on-surface/6"],
        "prev-next": ["hover:bg-on-surface/6"],
        today: ["ring-1", "ring-primary", "text-primary"],
        "today-prev-next": ["ring-1", "ring-primary"],
        selected: ["bg-primary", "text-on-primary", "font-medium"],
        "selected-prev-next": ["bg-primary"],
        disabled: ["cursor-not-allowed", "text-on-surface/25", "hover:bg-transparent"],
      },
    },
    defaultVariants: { state: "idle" },
  }
)

// Week-number column (full + showWeek): the row's leading week cell.
// Full-screen week column spans each date row (its own 2px top hairline).
const calendarWeekRowVariants = cva(
  [
    "text-[12px]", "text-on-surface-variant", "select-none",
    "text-center", "border-t-2", "border-t-solid",
    "border-t-outline-variant", "pt-[4px]",
  ],
  { variants: {}, defaultVariants: {} }
)

export type CalendarStyleVariants = {
  fullscreen: boolean
}

export const calendarRootClass = (variants: VariantProps<typeof calendarRootVariants>) =>
  twMerge(calendarRootVariants(variants))
export const calendarHeaderClass = (variants: VariantProps<typeof calendarHeaderVariants>) =>
  twMerge(calendarHeaderVariants(variants))
export const calendarSelectClass = (variants: VariantProps<typeof calendarSelectVariants>) =>
  twMerge(calendarSelectVariants(variants))
export const calendarModeSwitchClass = () => twMerge(calendarModeSwitchVariants())
export const calendarModeButtonClass = (variants: VariantProps<typeof calendarModeButtonVariants>) =>
  twMerge(calendarModeButtonVariants(variants))
export const calendarPanelClass = (variants: VariantProps<typeof calendarPanelVariants>) =>
  twMerge(calendarPanelVariants(variants))
export const calendarWeekdayClass = (variants: VariantProps<typeof calendarWeekdayVariants>) =>
  twMerge(calendarWeekdayVariants(variants))
export const calendarWeekdayRowClass = (variants: VariantProps<typeof calendarWeekdayRowVariants>) =>
  twMerge(calendarWeekdayRowVariants(variants))
export const calendarWeekdayRowPlaceholderClass = () =>
  twMerge(calendarWeekdayRowPlaceholderVariants())
export const calendarGridClass = (variants: VariantProps<typeof calendarGridVariants>) =>
  twMerge(calendarGridVariants(variants))
export const calendarFullDateClass = (variants: VariantProps<typeof calendarFullDateVariants>) =>
  twMerge(calendarFullDateVariants(variants))
export const calendarFullDateValueClass = (variants: VariantProps<typeof calendarFullDateValueVariants>) =>
  twMerge(calendarFullDateValueVariants(variants))
export const calendarFullDateContentClass = () =>
  twMerge(calendarFullDateContentVariants())
export const calendarMiniDateClass = (variants: VariantProps<typeof calendarMiniDateVariants>) =>
  twMerge(calendarMiniDateVariants(variants))
export const calendarFullMonthClass = (variants: VariantProps<typeof calendarFullMonthVariants>) =>
  twMerge(calendarFullMonthVariants(variants))
export const calendarMiniMonthClass = (variants: VariantProps<typeof calendarMiniMonthVariants>) =>
  twMerge(calendarMiniMonthVariants(variants))
export const calendarWeekRowClass = () => twMerge(calendarWeekRowVariants())

// Chevron glyphs for the year/month select triggers.
export const CALENDAR_SELECT_ICON = 'i-mdi-chevron-down'
export const CALENDAR_PREV_MONTH_ICON = 'i-mdi-chevron-left'
export const CALENDAR_NEXT_MONTH_ICON = 'i-mdi-chevron-right'
