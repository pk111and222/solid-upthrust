// @unocss-include
import { cva } from "class-variance-authority";

/** 走主题间距类的预设档位（small=8px，middle/medium=16px，large=24px）。 */
export type SpacePresetSize = "small" | "middle" | "medium" | "large";

const PRESET_SIZES: ReadonlySet<unknown> = new Set<SpacePresetSize>(["small", "middle", "medium", "large"]);

/** 用 Set 判断而非对象下标，避免 "constructor" 之类的字符串命中原型链。 */
export const isPresetSize = (size: unknown): size is SpacePresetSize => PRESET_SIZES.has(size);

/**
 * Space 根容器。gap/gapX/gapY 三组变体分别对应 size 的单值与 [水平, 垂直] 数组形式；
 * 所有类名都是 variants 下的字面量，保证 UnoCSS 静态扫描能提取。
 */
export const spaceVariants = cva([], {
  variants: {
    block: {
      true: ["flex", "w-full"],
      false: ["inline-flex"],
    },
    vertical: {
      true: ["flex-col"],
      false: ["flex-row"],
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
    gap: {
      small: ["gap-xs"],
      middle: ["gap-md"],
      medium: ["gap-md"],
      large: ["gap-lg"],
    },
    gapX: {
      small: ["gap-x-xs"],
      middle: ["gap-x-md"],
      medium: ["gap-x-md"],
      large: ["gap-x-lg"],
    },
    gapY: {
      small: ["gap-y-xs"],
      middle: ["gap-y-md"],
      medium: ["gap-y-md"],
      large: ["gap-y-lg"],
    },
  },
});

/** 每个子节点的包裹层：子节点渲染为空时整个 item 隐藏，不占间距。 */
export const SPACE_ITEM_CLASS = "space-item empty:hidden";
/** 分隔符包裹层：不参与伸缩。 */
export const SPACE_SEPARATOR_CLASS = "space-separator flex-none";

/**
 * Compact 让直接子元素首尾相接：内侧圆角清零 + 相邻重叠 1px，避免双线边框。
 * 选择器作用于任意子元素（Button、Input、Select…），`!` 压过子元素自身的圆角类；
 * 悬停/聚焦的子元素提升 z-index，使其高亮边框不被右侧（下方）邻居盖住。
 * 选择器只命中直接子元素：把边框画在内部节点上的控件（Input 无前后缀时的 input、
 * Select 的 combobox）须让内部节点 `rounded-[inherit]`，圆角覆盖才能传到真正的边框。
 */
export const compactVariants = cva(
  ["[&>*:hover]:z-1", "[&>*:focus-within]:z-1", "[&>*:focus]:z-1"],
  {
    variants: {
      block: {
        true: ["flex", "w-full"],
        false: ["inline-flex"],
      },
      vertical: {
        true: [
          "flex-col",
          "[&>*:first-child:not(:last-child)]:!rounded-b-none",
          "[&>*:last-child:not(:first-child)]:!rounded-t-none",
          "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
          "[&>*:not(:first-child)]:-mt-px",
        ],
        false: [
          "flex-row",
          "[&>*:first-child:not(:last-child)]:!rounded-r-none",
          "[&>*:last-child:not(:first-child)]:!rounded-l-none",
          "[&>*:not(:first-child):not(:last-child)]:!rounded-none",
          "[&>*:not(:first-child)]:-ml-px",
        ],
      },
    },
  },
);

/**
 * Space.Addon：紧凑组合里的带边框文本单元。不固定高度——Compact 的交叉轴默认
 * stretch，Addon 随相邻控件（small/middle/large）等高。
 */
export const SPACE_ADDON_CLASS = [
  "inline-flex", "items-center", "px-sm",
  "border", "border-solid", "border-outline", "rounded",
  "bg-on-surface/4", "text-on-surface", "text-body", "whitespace-nowrap",
];
