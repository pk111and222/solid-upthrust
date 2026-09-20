// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Tree styles — antd6 spec:
 *  - rows: 24px-tall indent-driven tree lines; switcher (chevron) rotates
 *    90° when expanded; leaf switchers collapse to an invisible slot that
 *    KEEPS the indent so rows align
 *  - expand animation: the grid-rows-[0fr/1fr] track (the Collapse
 *    contract — max-h truncates deep trees, grid tracks don't)
 *  - checkable: the Cascader checkbox family (14px box, check/minus mark)
 *  - matched labels (search) get the primary text + weight
 */
import { cva, type VariantProps } from "class-variance-authority";

const treeRootVariants = cva(
  ["w-full", "min-w-0", "text-on-surface"],
  {
    variants: {
      showLine: {
        true: [],
        false: [],
      },
    },
    defaultVariants: { showLine: false },
  },
)

export const treeRootClass = (variants: VariantProps<typeof treeRootVariants>) =>
  twMerge(treeRootVariants(variants));

/** One node row (the full-width clickable strip). */
const treeNodeVariants = cva(
  [
    "flex", "items-center", "gap-[4px]",
    "h-[24px]", "pr-[8px]", "rounded",
    "cursor-pointer", "select-none",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      selected: {
        true: ["bg-primary/8"],
        false: ["hover:bg-on-surface/6"],
      },
      disabled: {
        true: ["cursor-not-allowed", "opacity-45", "hover:bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { selected: false, disabled: false },
  },
)

export const treeNodeWrapClass = (variants: VariantProps<typeof treeNodeVariants>) =>
  twMerge(treeNodeVariants(variants));

/** The switcher slot (leaf: invisible, keeps the width for alignment). */
const treeSwitcherVariants = cva(
  [
    "flex", "items-center", "justify-center", "shrink-0",
    "w-[18px]", "h-[18px]", "rounded-sm",
    "text-[14px]", "text-on-surface/45",
    "transition-transform", "duration-fast", "ease-upthrust",
  ],
  {
    variants: {
      leaf: {
        true: ["invisible"],
        false: ["hover:bg-on-surface/6", "hover:text-on-surface"],
      },
      expanded: {
        true: ["rotate-90"],
        false: [],
      },
    },
    defaultVariants: { leaf: false, expanded: false },
  },
)

export const treeSwitcherWrapClass = (variants: VariantProps<typeof treeSwitcherVariants>) =>
  twMerge(treeSwitcherVariants(variants));

/** The node label text (matched highlights in search). */
const treeNodeLabelVariants = cva(
  ["truncate", "min-w-0", "text-[14px]", "leading-[24px]", "py-[2px]", "px-[4px]", "rounded-sm"],
  {
    variants: {
      matched: {
        true: ["!text-primary", "font-medium"],
        false: ["text-on-surface"],
      },
      selected: {
        true: ["!text-primary", "font-medium"],
        false: [],
      },
      disabled: {
        true: ["!text-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { matched: false, selected: false, disabled: false },
  },
)

export const treeNodeLabelWrapClass = (variants: VariantProps<typeof treeNodeLabelVariants>) =>
  twMerge(treeNodeLabelVariants(variants));

/** The children track — grid-rows animation (the Collapse contract). */
const treeChildrenVariants = cva(
  ["grid", "transition-upthrust", "duration-mid"],
  {
    variants: {
      open: {
        true: ["grid-rows-[1fr]"],
        false: ["grid-rows-[0fr]"],
      },
    },
    defaultVariants: { open: false },
  },
)

export const treeChildrenWrapClass = (variants: VariantProps<typeof treeChildrenVariants>) =>
  twMerge(treeChildrenVariants(variants));

/** The single grid cell inside the track (min-h-0 + overflow-hidden REQUIRED). */
export const treeChildrenInnerClass = () =>
  twMerge(["min-h-0", "overflow-hidden"]);

/** The checkbox (Cascader checkbox family). */
const treeCheckboxVariants = cva(
  [
    "flex", "items-center", "justify-center", "shrink-0",
    "h-[14px]", "w-[14px]", "rounded-sm", "border", "border-solid",
    "border-outline", "transition-upthrust-fast", "mr-[4px]",
  ],
  {
    variants: {
      state: {
        checked: ["!bg-primary", "!border-primary"],
        indeterminate: ["!bg-surface", "!border-primary"],
        unchecked: [],
      },
      disabled: {
        true: ["!border-on-surface/15", "cursor-not-allowed"],
        false: [],
      },
    },
    defaultVariants: { state: "unchecked", disabled: false },
  },
)

export const treeCheckboxWrapClass = (variants: VariantProps<typeof treeCheckboxVariants>) =>
  twMerge(treeCheckboxVariants(variants));

/** The check mark / dash inside the box. */
const treeCheckboxMarkVariants = cva(
  ["inline-flex", "items-center", "justify-center", "text-[10px]", "leading-none", "pointer-events-none"],
  {
    variants: {
      state: {
        checked: ["text-white", "opacity-100", "scale-100"],
        indeterminate: ["text-primary", "opacity-100", "scale-100"],
        unchecked: ["opacity-0", "scale-0"],
      },
      disabled: {
        true: ["text-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { state: "unchecked", disabled: false },
  },
)

export const treeCheckboxMarkWrapClass = (variants: VariantProps<typeof treeCheckboxMarkVariants>) =>
  twMerge(treeCheckboxMarkVariants(variants));

/** The dropdown panel variant (used by TreeSelect) — overflow scroll slot. */
export const treeDropdownListClass = () =>
  twMerge(["max-h-[264px]", "overflow-y-auto", "py-[4px]"]);

export const TREE_SWITCHER_ICON = 'i-mdi-chevron-right'
