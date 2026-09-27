import { VariantProps } from 'class-variance-authority';
/**
 * Row: flex row that wraps by default. justify/align emit a class only when
 * set — an unset align leaves the CSS default (stretch), which is what the
 * reference implementation actually renders.
 */
export declare const rowClass: (props?: ({
    wrap?: boolean | null | undefined;
    justify?: "start" | "end" | "center" | "space-around" | "space-between" | "space-evenly" | null | undefined;
    align?: "middle" | "bottom" | "top" | "stretch" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type RowStyleVariants = VariantProps<typeof rowClass>;
/** `max-w-full` is dropped when the base layer writes its own max-width. */
export declare const COL_BASE_CLASS: readonly ["relative", "min-h-px"];
export declare const COL_DEFAULT_MAX_WIDTH_CLASS = "max-w-full";
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
export declare const COL_LAYER_CLASS: Record<ColLayer, Record<ColField | "hidden" | "block", string>>;
/** CSS variable written inline for a layer/field pair. */
export declare const colVar: (layer: ColLayer, field: ColField) => string;
