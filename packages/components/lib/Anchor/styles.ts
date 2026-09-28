// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

/**
 * Anchor 视觉层（对齐 antd 6 Anchor 样式 token）。
 *
 *  - vertical：列表左侧 2px 轨道（colorSplit → outline-variant，::before 贯穿列表全高），
 *    激活链接旁 2px primary ink，top/height 跟随激活标题，过渡 top 0.3s。
 *  - horizontal：底部 1px 轨道，ink 贴底 2px，left/width 跟随激活标题；首个链接无左内边距。
 *  - 链接：上下 4px、左 16px（嵌套上下 2px）；标题 14px、单行省略，激活为 primary。
 *
 * 视觉类都写在 variants 的值里（UnoCSS 静态扫描），不使用 compoundVariants。
 */

const FOCUS_RING = [
  "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary", "focus-visible:-outline-offset-2",
];

/** 最外层 wrapper：vertical 超出视口时自身滚动（max-height 由组件内联）。 */
const anchorWrapperVariants = cva(["box-border", "bg-transparent", "text-[14px]", "leading-[1.5714]"], {
  variants: {
    direction: {
      vertical: ["overflow-auto"],
      horizontal: [
        "relative", "overflow-x-auto", "[scrollbar-width:none]",
        "before:content-['']", "before:absolute", "before:inset-x-0", "before:bottom-0", "before:h-[1px]", "before:bg-outline-variant",
      ],
    },
  },
  defaultVariants: { direction: "vertical" },
});

/** 链接列表：vertical 的 ::before 是左侧 2px 轨道。 */
const anchorContainerVariants = cva(["relative", "m-0", "box-border"], {
  variants: {
    direction: {
      vertical: [
        "ps-[2px]",
        "before:content-['']", "before:absolute", "before:start-0", "before:top-0", "before:h-full", "before:w-[2px]", "before:bg-outline-variant",
      ],
      horizontal: ["flex", "items-center"],
    },
  },
  defaultVariants: { direction: "vertical" },
});

const anchorLinkVariants = cva(["box-border"], {
  variants: {
    layout: {
      vertical: ["py-[4px]", "ps-[16px]"],
      /** 嵌套链接：上下 2px（antd anchorPaddingBlockSecondary）。 */
      nested: ["py-[2px]", "ps-[16px]"],
      horizontal: ["flex-none", "py-[4px]", "ps-[16px]", "first-of-type:ps-0"],
    },
  },
  defaultVariants: { layout: "vertical" },
});

const anchorTitleVariants = cva(
  [
    "relative", "block", "overflow-hidden", "text-ellipsis", "whitespace-nowrap", "no-underline",
    "transition-upthrust", "rounded-sm", ...FOCUS_RING,
  ],
  {
    variants: {
      state: {
        idle: ["text-on-surface"],
        active: ["text-primary"],
      },
      /** vertical 标题下留 3px，唯一子节点（无嵌套）时取消；horizontal 无下边距。 */
      spacing: {
        vertical: ["mb-[3px]", "[&:only-child]:mb-0"],
        horizontal: ["mb-0"],
      },
    },
    defaultVariants: { state: "idle", spacing: "vertical" },
  }
);

const anchorInkVariants = cva(["absolute", "bg-primary", "pointer-events-none", "duration-slow", "ease-in-out"], {
  variants: {
    direction: {
      vertical: ["start-0", "w-[2px]", "transition-[top,height]"],
      horizontal: ["bottom-0", "h-[2px]", "transition-[left,width]"],
    },
    visible: {
      true: ["block"],
      false: ["hidden"],
    },
  },
  defaultVariants: { direction: "vertical", visible: false },
});

export const anchorWrapperClass = (variants: VariantProps<typeof anchorWrapperVariants>) => twMerge(anchorWrapperVariants(variants));
export const anchorContainerClass = (variants: VariantProps<typeof anchorContainerVariants>) => twMerge(anchorContainerVariants(variants));
export const anchorLinkClass = (variants: VariantProps<typeof anchorLinkVariants>) => twMerge(anchorLinkVariants(variants));
export const anchorTitleClass = (variants: VariantProps<typeof anchorTitleVariants>) => twMerge(anchorTitleVariants(variants));
export const anchorInkClass = (variants: VariantProps<typeof anchorInkVariants>) => twMerge(anchorInkVariants(variants));

export type AnchorTitleVariants = VariantProps<typeof anchorTitleVariants>;
