// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { SizeType } from '../../common/type'

// Named size -> spacing token classes (small=8 / middle=16 / large=24).
export const SPACE_GAP_CLASS: Record<SizeType, string> = {
  small: 'gap-xs',
  middle: 'gap-md',
  large: 'gap-lg',
}

export const SPACE_COL_GAP_CLASS: Record<SizeType, string> = {
  small: 'gap-x-xs',
  middle: 'gap-x-md',
  large: 'gap-x-lg',
}

export const SPACE_ROW_GAP_CLASS: Record<SizeType, string> = {
  small: 'gap-y-xs',
  middle: 'gap-y-md',
  large: 'gap-y-lg',
}

const spaceVariants = cva(
  ["inline-flex"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row", "items-center"],
        vertical: ["flex-col"],
      },
      wrap: {
        true: ["flex-wrap"],
        false: [],
      },
      align: {
        start: ["items-start"],
        center: ["items-center"],
        end: ["items-end"],
        baseline: ["items-baseline"],
      },
      block: {
        true: ["flex", "w-full"],
        false: [],
      },
    },
    defaultVariants: {
      direction: "horizontal",
      wrap: false,
      block: false,
    },
  }
);

/**
 * Compact joins direct children edge-to-edge: radius stripping on inner
 * corners plus a -1px overlap so adjacent borders don't double up. The
 * selectors act on any child (Button, Select, ...); `!important` wins over
 * the children's own non-important rounded/border classes.
 */
const compactVariants = cva(
  ["inline-flex"],
  {
    variants: {
      direction: {
        horizontal: [
          "flex-row",
          "[&>*:first-child:not(:last-child)]:!rounded-r-none",
          "[&>*:last-child:not(:first-child)]:!rounded-l-none",
          "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
          "[&>*:not(:first-child)]:-ml-px",
        ],
        vertical: [
          "flex-col",
          "[&>*:first-child:not(:last-child)]:!rounded-b-none",
          "[&>*:last-child:not(:first-child)]:!rounded-t-none",
          "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
          "[&>*:not(:first-child)]:-mt-px",
        ],
      },
      block: {
        true: ["flex", "w-full"],
        false: [],
      },
    },
    defaultVariants: {
      direction: "horizontal",
      block: false,
    },
  }
);

export type SpaceStyleVariants = VariantProps<typeof spaceVariants>;
export const spaceClass = (variants: SpaceStyleVariants) => twMerge(spaceVariants(variants));
export const compactClass = (variants: VariantProps<typeof compactVariants>) => twMerge(compactVariants(variants));
