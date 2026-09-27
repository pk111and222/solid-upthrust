// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Row: flex row that wraps by default. justify/align emit a class only when
 * set — an unset align leaves the CSS default (stretch), which is what the
 * reference implementation actually renders.
 */
export const rowClass = cva(["flex", "min-w-0"], {
  variants: {
    wrap: {
      true: ["flex-wrap"],
      false: ["flex-nowrap"],
    },
    justify: {
      start: ["justify-start"],
      end: ["justify-end"],
      center: ["justify-center"],
      "space-around": ["justify-around"],
      "space-between": ["justify-between"],
      "space-evenly": ["justify-evenly"],
    },
    align: {
      top: ["items-start"],
      middle: ["items-center"],
      bottom: ["items-end"],
      stretch: ["items-stretch"],
    },
  },
});

export type RowStyleVariants = VariantProps<typeof rowClass>;

/** `max-w-full` is dropped when the base layer writes its own max-width. */
export const COL_BASE_CLASS = ["relative", "min-h-px"] as const;
export const COL_DEFAULT_MAX_WIDTH_CLASS = "max-w-full";

export type ColLayer = "base" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
export type ColField = "flex" | "max-width" | "offset" | "push" | "pull" | "order";

/**
 * Per-layer, per-field classes. Each class consumes a CSS variable that Col
 * writes inline on the same element (--ut-col[-<bp>]-<field>), and is only
 * attached when that variable is set — an unset var would otherwise reset the
 * property (and custom properties inherit into nested columns).
 *
 * Breakpoint widths are zero-padded (0576px) on purpose: UnoCSS orders
 * arbitrary `min-[…]` media blocks by string comparison, so 576/768/992 would
 * sort after 1200/1600/1920 and a narrower layer would beat a wider one.
 * Every class is a string literal so UnoCSS can extract it statically.
 */
export const COL_LAYER_CLASS: Record<ColLayer, Record<ColField | "hidden" | "block", string>> = {
  base: {
    flex: "[flex:var(--ut-col-flex)]",
    "max-width": "[max-width:var(--ut-col-max-width)]",
    offset: "[margin-inline-start:var(--ut-col-offset)]",
    push: "[inset-inline-start:var(--ut-col-push)]",
    pull: "[inset-inline-end:var(--ut-col-pull)]",
    order: "[order:var(--ut-col-order)]",
    hidden: "hidden",
    block: "block",
  },
  sm: {
    flex: "min-[0576px]:[flex:var(--ut-col-sm-flex)]",
    "max-width": "min-[0576px]:[max-width:var(--ut-col-sm-max-width)]",
    offset: "min-[0576px]:[margin-inline-start:var(--ut-col-sm-offset)]",
    push: "min-[0576px]:[inset-inline-start:var(--ut-col-sm-push)]",
    pull: "min-[0576px]:[inset-inline-end:var(--ut-col-sm-pull)]",
    order: "min-[0576px]:[order:var(--ut-col-sm-order)]",
    hidden: "min-[0576px]:hidden",
    block: "min-[0576px]:block",
  },
  md: {
    flex: "min-[0768px]:[flex:var(--ut-col-md-flex)]",
    "max-width": "min-[0768px]:[max-width:var(--ut-col-md-max-width)]",
    offset: "min-[0768px]:[margin-inline-start:var(--ut-col-md-offset)]",
    push: "min-[0768px]:[inset-inline-start:var(--ut-col-md-push)]",
    pull: "min-[0768px]:[inset-inline-end:var(--ut-col-md-pull)]",
    order: "min-[0768px]:[order:var(--ut-col-md-order)]",
    hidden: "min-[0768px]:hidden",
    block: "min-[0768px]:block",
  },
  lg: {
    flex: "min-[0992px]:[flex:var(--ut-col-lg-flex)]",
    "max-width": "min-[0992px]:[max-width:var(--ut-col-lg-max-width)]",
    offset: "min-[0992px]:[margin-inline-start:var(--ut-col-lg-offset)]",
    push: "min-[0992px]:[inset-inline-start:var(--ut-col-lg-push)]",
    pull: "min-[0992px]:[inset-inline-end:var(--ut-col-lg-pull)]",
    order: "min-[0992px]:[order:var(--ut-col-lg-order)]",
    hidden: "min-[0992px]:hidden",
    block: "min-[0992px]:block",
  },
  xl: {
    flex: "min-[1200px]:[flex:var(--ut-col-xl-flex)]",
    "max-width": "min-[1200px]:[max-width:var(--ut-col-xl-max-width)]",
    offset: "min-[1200px]:[margin-inline-start:var(--ut-col-xl-offset)]",
    push: "min-[1200px]:[inset-inline-start:var(--ut-col-xl-push)]",
    pull: "min-[1200px]:[inset-inline-end:var(--ut-col-xl-pull)]",
    order: "min-[1200px]:[order:var(--ut-col-xl-order)]",
    hidden: "min-[1200px]:hidden",
    block: "min-[1200px]:block",
  },
  xxl: {
    flex: "min-[1600px]:[flex:var(--ut-col-xxl-flex)]",
    "max-width": "min-[1600px]:[max-width:var(--ut-col-xxl-max-width)]",
    offset: "min-[1600px]:[margin-inline-start:var(--ut-col-xxl-offset)]",
    push: "min-[1600px]:[inset-inline-start:var(--ut-col-xxl-push)]",
    pull: "min-[1600px]:[inset-inline-end:var(--ut-col-xxl-pull)]",
    order: "min-[1600px]:[order:var(--ut-col-xxl-order)]",
    hidden: "min-[1600px]:hidden",
    block: "min-[1600px]:block",
  },
  xxxl: {
    flex: "min-[1920px]:[flex:var(--ut-col-xxxl-flex)]",
    "max-width": "min-[1920px]:[max-width:var(--ut-col-xxxl-max-width)]",
    offset: "min-[1920px]:[margin-inline-start:var(--ut-col-xxxl-offset)]",
    push: "min-[1920px]:[inset-inline-start:var(--ut-col-xxxl-push)]",
    pull: "min-[1920px]:[inset-inline-end:var(--ut-col-xxxl-pull)]",
    order: "min-[1920px]:[order:var(--ut-col-xxxl-order)]",
    hidden: "min-[1920px]:hidden",
    block: "min-[1920px]:block",
  },
};

/** CSS variable written inline for a layer/field pair. */
export const colVar = (layer: ColLayer, field: ColField) =>
  layer === "base" ? `--ut-col-${field}` : `--ut-col-${layer}-${field}`;
