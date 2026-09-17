import { VariantProps } from 'class-variance-authority';
declare const wrapperVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    status?: "error" | "warning" | "default" | null | undefined;
    disabled?: boolean | null | undefined;
    affixLayout?: "none" | "prefixOnly" | "suffixOnly" | "both" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** The <input> element itself — always borderless; visual frame lives on
 *  the bare-input cva or the wrapper cva above depending on affix mode. */
declare const innerInputVariants: (props?: ({
    disabled?: boolean | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * Affix slot — sits INSIDE the wrapper frame. antd affix paddings:
 *   - prefix: marginInlineEnd = inputAffixPadding (4px)
 *   - suffix: marginInlineStart = inputAffixPadding (4px)
 * The frame-side padding (11px/7px) lives on the WRAPPER via affixLayout,
 * NOT here — this keeps the clear-icon-only input's text at 11px from the
 * left edge (the asymmetric padding bug).
 */
export declare const affixVariants: (props?: ({
    side?: "prefix" | "suffix" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
    clickable?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** antd clear icon: colorTextQuaternary, hover colorTextTertiary, font
 *  size = fontSizeIcon (12). visibility toggles WITHOUT unmounting (the
 *  -hidden class), so the suffix row never reflows its siblings. */
export declare const clearIconVariants: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type InputStyleVariants = VariantProps<typeof wrapperVariants> & VariantProps<typeof innerInputVariants>;
export declare const inputClass: (variants: InputStyleVariants & {
    inWrapper?: boolean;
}) => string;
export declare const innerInputClass: (variants: VariantProps<typeof innerInputVariants>) => string;
export declare const inputWrapperClass: (variants: VariantProps<typeof wrapperVariants>) => string;
export declare const affixClass: (variants: VariantProps<typeof affixVariants>) => string;
export declare const clearIconClass: (variants: VariantProps<typeof clearIconVariants>) => string;
/**
 * TextArea — antd6 textarea styles. Unlike the bare <input>, a <textarea>
 * must NOT borrow the h-control token: its height comes from content and
 * `rows`, never a fixed control height. Padding 4px ∀y / 11px ∀x matches
 * the input frame; line-height 1.5714 reproduces antd's word-wrapping
 * density. There is no SizeType here because antd has no sm/lg for textarea.
 */
declare const textAreaVariants: (props?: ({
    status?: "error" | "warning" | "default" | null | undefined;
    disabled?: boolean | null | undefined;
    autoSize?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const textAreaClass: (variants: VariantProps<typeof textAreaVariants>) => string;
export {};
