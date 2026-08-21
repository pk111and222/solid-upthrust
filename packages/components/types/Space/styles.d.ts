import { VariantProps } from 'class-variance-authority';
import { SizeType } from '../../common/type';
export declare const SPACE_GAP_CLASS: Record<SizeType, string>;
export declare const SPACE_COL_GAP_CLASS: Record<SizeType, string>;
export declare const SPACE_ROW_GAP_CLASS: Record<SizeType, string>;
declare const spaceVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
    wrap?: boolean | null | undefined;
    align?: "start" | "end" | "center" | "baseline" | null | undefined;
    block?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * Compact joins direct children edge-to-edge: radius stripping on inner
 * corners plus a -1px overlap so adjacent borders don't double up. The
 * selectors act on any child (Button, Select, ...); `!important` wins over
 * the children's own non-important rounded/border classes.
 */
declare const compactVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
    block?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type SpaceStyleVariants = VariantProps<typeof spaceVariants>;
export declare const spaceClass: (variants: SpaceStyleVariants) => string;
export declare const compactClass: (variants: VariantProps<typeof compactVariants>) => string;
export {};
