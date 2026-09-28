// @unocss-include
import { cva } from "class-variance-authority";

/**
 * Breadcrumb 视觉层（对齐 antd 6 Breadcrumb 样式 token）。
 *
 *  - 根：fontSize 14 / lineHeight 1.5714，itemColor = colorTextDescription（on-surface/45）
 *  - 最后一项：lastItemColor = colorText（on-surface）；链接保持 linkColor，不受最后一项影响
 *  - 链接：padding 0 4px、marginInline -4px、圆角 4px、高 22px；hover 文字 colorText + 背景 colorBgTextHover
 *  - 分隔符：marginInline 8px，separatorColor = colorTextDescription
 *  - 下拉触发区（overlay-link）：与链接同尺寸，箭头 12px、左距 4px
 */

const FOCUS_RING = [
  "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary", "focus-visible:outline-offset-0",
];

/** 根：自定义 title / itemRender 里的裸 a 也使用 linkColor、无下划线（antd `.ant-breadcrumb a`）。 */
export const breadcrumbRootClass = cva([
  "block", "m-0", "p-0", "text-[14px]", "leading-[1.5714]", "text-on-surface/45",
  "[&_a]:text-on-surface/45", "[&_a]:no-underline", "[&_a:hover]:text-on-surface",
]);

/** ol 列表；children 写法下每项后都跟一个自动分隔符，隐藏最后一个。 */
export const breadcrumbListClass = cva(["flex", "flex-wrap", "m-0", "p-0", "list-none"], {
  variants: {
    legacy: {
      true: ["[&>li[data-breadcrumb-auto]:last-child]:hidden"],
      false: [],
    },
  },
  defaultVariants: { legacy: false },
});

/** 面包屑项 li：最后一项文字为 on-surface（children 写法下最后一项后面还有被隐藏的分隔符）。 */
export const breadcrumbItemClass = cva(["m-0", "p-0"], {
  variants: {
    legacy: {
      true: ["[&:nth-last-child(2)]:text-on-surface"],
      false: ["last:text-on-surface"],
    },
  },
  defaultVariants: { legacy: false },
});

/** 链接 a 与纯文本 span（antd `-link`）；样式只作用于 a，span 仅继承 li 颜色。图标与文字间距 4px。 */
export const breadcrumbLinkClass = cva(["inline-flex", "items-center", "gap-[4px]", "align-top"], {
  variants: {
    kind: {
      anchor: [
        "h-[22px]", "px-[4px]", "-mx-[4px]", "rounded-sm", "text-on-surface/45", "no-underline", "cursor-pointer",
        "transition-upthrust-fast", "hover:text-on-surface", "hover:bg-on-surface/6", ...FOCUS_RING,
      ],
      text: [],
    },
  },
  defaultVariants: { kind: "text" },
});

export const breadcrumbSeparatorClass = cva(["mx-[8px]", "text-on-surface/45", "select-none"]);

/** 带下拉菜单的项：触发区 hover 时整体高亮，内部链接不再叠加背景。 */
export const breadcrumbOverlayClass = cva([
  "inline-flex", "items-center", "align-top", "h-[22px]", "px-[4px]", "-mx-[4px]", "rounded-sm", "cursor-pointer",
  "transition-upthrust-fast", "hover:text-on-surface", "hover:bg-on-surface/6",
  "[&:hover_a]:text-on-surface", "[&_a:hover]:bg-transparent",
]);

/** 下拉菜单项带 path 时渲染的链接：继承菜单项颜色、无下划线。 */
export const BREADCRUMB_MENU_LINK_CLASS = ["text-inherit", "no-underline", "hover:text-inherit"];

/** 下拉箭头（DownOutlined，fontSizeIcon 12px，左距 4px）。图标类单独导出，便于死类检测排除图标集。 */
export const BREADCRUMB_OVERLAY_ICON_CLASS = ["i-mdi-chevron-down", "text-[12px]", "ms-[4px]"];
