// @unocss-include
import { cva } from "class-variance-authority";

/**
 * Menu 视觉层（对齐 antd 6 Menu 样式 token）。
 *
 * 全部视觉类都写在 variants 的合并键里（theme × flavor × state），UnoCSS 静态扫描
 * 才能提取；不使用 compoundVariants。
 *
 *  - 浅色：itemHoverBg = on-surface/6、选中 / 按下 = primary/10、inline 子菜单底 on-surface/2、
 *    弹层 surface + boxShadowSecondary、分组标题 on-surface/45、禁用 on-surface/25。
 *  - 深色：与本库 Sider 深色一致使用 inverse-surface（antd 为 #001529），文字 65% → hover 100%，
 *    选中 bg-primary + on-primary；危险项选中 bg-error + on-error；水平深色无下划线、无底边框。
 */

/** 与 Tooltip / Dropdown 一致的键盘焦点环。 */
const FOCUS_RING = [
  "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary", "focus-visible:-outline-offset-2",
];

export type MenuThemeKey = "light" | "dark";

// ---- root ul ---------------------------------------------------------------
export const menuRootClass = cva(
  [
    "m-0", "p-0", "list-none", "text-[14px]", "outline-none", "box-border",
    // 收起 / 展开的宽度过渡（antd：width 0.3s cubic-bezier(0.2, 0, 0, 1)）。
    "transition-[width]", "duration-slow", "ease-[cubic-bezier(0.2,0,0,1)]",
    ...FOCUS_RING,
  ],
  {
    variants: {
      scheme: {
        "light-vertical": ["block", "bg-surface", "text-on-surface", "border-0", "border-e", "border-solid", "border-outline-variant"],
        "light-inline": ["block", "w-full", "bg-surface", "text-on-surface", "border-0", "border-e", "border-solid", "border-outline-variant"],
        "light-horizontal": ["flex", "items-stretch", "leading-[46px]", "bg-surface", "text-on-surface", "border-0", "border-b", "border-solid", "border-outline-variant"],
        "dark-vertical": ["block", "bg-inverse-surface", "text-inverse-on-surface/65", "border-0"],
        "dark-inline": ["block", "w-full", "bg-inverse-surface", "text-inverse-on-surface/65", "border-0"],
        "dark-horizontal": ["flex", "items-stretch", "leading-[46px]", "bg-inverse-surface", "text-inverse-on-surface/65", "border-0"],
      },
      collapsed: {
        true: ["w-[80px]"],
        false: [],
      },
    },
    defaultVariants: { scheme: "light-vertical", collapsed: false },
  },
);

// ---- item / submenu title ----------------------------------------------------
/**
 * 菜单项（li）与子菜单标题（div）共用。
 *  - block：vertical / inline 根列表，40px 高、左右 4px 外边距、8px 圆角
 *  - popup：弹出层内，圆角 4px
 *  - collapsed：inline 收起时的一级项，左右 padding = calc(50% - 8px - 4px) 使图标居中
 *  - horizontal：水平一级项，inline 区块 + 底部 2px 指示条（::after）
 */
export const menuItemClass = cva(
  [
    "relative", "box-border", "cursor-pointer", "whitespace-nowrap", "outline-none", "list-none",
    "transition-[border-color,background-color,padding,color]", "duration-slow", "ease-upthrust",
    ...FOCUS_RING,
    // 链接铺满整项并继承颜色（antd `a::before { inset: 0 }`）。
    "[&_a]:text-inherit", "[&_a:hover]:text-inherit", "[&_a]:no-underline",
  ],
  {
    variants: {
      layout: {
        block: [
          "flex", "items-center", "h-[40px]", "leading-[40px]", "px-[16px]", "mx-[4px]", "my-[4px]",
          "w-[calc(100%-8px)]", "overflow-hidden", "text-ellipsis", "rounded-lg",
        ],
        popup: [
          "flex", "items-center", "h-[40px]", "leading-[40px]", "px-[16px]", "mx-[4px]", "my-[4px]",
          "w-[calc(100%-8px)]", "overflow-hidden", "text-ellipsis", "rounded-sm",
        ],
        collapsed: [
          "flex", "items-center", "h-[40px]", "leading-[40px]", "px-[calc(50%-12px)]", "mx-[4px]", "my-[4px]",
          "w-[calc(100%-8px)]", "overflow-hidden", "text-clip", "rounded-lg",
        ],
        horizontal: [
          "flex", "items-center", "flex-none", "px-[16px]", "top-[1px]", "-mt-[1px]",
          "after:content-['']", "after:absolute", "after:inset-x-[16px]", "after:bottom-0", "after:pointer-events-none",
          "after:border-0", "after:border-b-2", "after:border-solid", "after:border-transparent",
          "after:transition-[border-color]", "after:duration-slow", "after:ease-upthrust",
        ],
      },
      /** 分组内的项左侧多缩进（antd group list paddingInline: 28px 16px）。 */
      grouped: {
        true: ["ps-[28px]"],
        false: [],
      },
      /** 子菜单标题为箭头预留右侧空间（menuArrowSize + padding + marginXS = 34px）。 */
      arrow: {
        true: ["pe-[34px]"],
        false: [],
      },
      tone: {
        // 浅色 vertical / inline / popup
        "light-v-idle": ["text-on-surface", "hover:bg-on-surface/6", "active:bg-primary/10"],
        "light-v-active": ["text-primary", "hover:bg-on-surface/6", "active:bg-primary/10"],
        "light-v-selected": ["text-primary", "bg-primary/10"],
        "light-v-danger": ["text-error", "hover:bg-on-surface/6", "active:bg-error/10"],
        "light-v-danger-selected": ["text-error", "bg-error/10"],
        "light-v-disabled": ["text-on-surface/25", "cursor-not-allowed", "[&_a]:pointer-events-none"],
        // 浅色水平一级项：hover 文字变 primary、底部指示条；无背景
        "light-h-idle": ["text-on-surface", "hover:text-primary", "hover:after:border-b-primary"],
        "light-h-active": ["text-primary", "after:border-b-primary"],
        "light-h-selected": ["text-primary", "after:border-b-primary"],
        "light-h-danger": ["text-error", "hover:after:border-b-primary"],
        "light-h-danger-selected": ["text-error", "after:border-b-primary"],
        "light-h-disabled": ["text-on-surface/25", "cursor-not-allowed", "[&_a]:pointer-events-none"],
        // 深色 vertical / inline / popup
        "dark-v-idle": ["text-inverse-on-surface/65", "hover:text-inverse-on-surface"],
        "dark-v-active": ["text-inverse-on-surface", "hover:text-inverse-on-surface"],
        "dark-v-selected": ["text-on-primary", "bg-primary"],
        "dark-v-danger": ["text-error", "hover:text-error", "active:bg-error", "active:text-on-error"],
        "dark-v-danger-selected": ["text-on-error", "bg-error"],
        "dark-v-disabled": ["text-inverse-on-surface/25", "cursor-not-allowed", "[&_a]:pointer-events-none"],
        // 深色水平：选中整块 primary 底色，无下划线
        "dark-h-idle": ["text-inverse-on-surface/65", "hover:text-inverse-on-surface"],
        "dark-h-active": ["text-inverse-on-surface", "hover:text-inverse-on-surface"],
        "dark-h-selected": ["text-on-primary", "bg-primary"],
        "dark-h-danger": ["text-error", "hover:text-error"],
        "dark-h-danger-selected": ["text-on-error", "bg-error"],
        "dark-h-disabled": ["text-inverse-on-surface/25", "cursor-not-allowed", "[&_a]:pointer-events-none"],
      },
    },
    defaultVariants: { layout: "block", grouped: false, arrow: false, tone: "light-v-idle" },
  },
);

/**
 * 子菜单 li 容器：非水平时只是结构节点；水平一级时由 menuItemClass 承担视觉。
 * 不能 relative：嵌套弹层直接渲染在父弹层内，需以父弹层（absolute）为定位祖先，
 * 才不会被父列表的 overflow-y-auto 裁剪。
 */
export const menuSubmenuClass = cva(["list-none", "p-0", "m-0"], {
  variants: {
    /** 水平一级子菜单：作为 flex 项不被压缩（视觉在标题 div 上）。 */
    horizontal: {
      true: ["flex-none"],
      false: [],
    },
  },
  defaultVariants: { horizontal: false },
});

/** inline 收起时的悬浮提示：链接继承 tooltip 文字色、去下划线。 */
export const MENU_TOOLTIP_CLASS = ["[&_a]:text-inherit", "[&_a]:no-underline"];

// ---- icon / content / extra ----------------------------------------------------
export const menuIconClass = cva(
  [
    "inline-flex", "items-center", "justify-center", "flex-none", "leading-none",
    "transition-[font-size,margin,color]", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      collapsed: {
        true: ["min-w-[16px]", "text-[16px]", "m-0"],
        false: ["min-w-[14px]", "text-[14px]"],
      },
    },
    defaultVariants: { collapsed: false },
  },
);

export const menuContentClass = cva(
  [
    "min-w-0", "overflow-hidden", "text-ellipsis", "whitespace-nowrap",
    "transition-[opacity,margin,color,width]", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      /** 有图标时与图标间距 10px（antd iconMarginInlineEnd = controlHeightSM - fontSize）。 */
      withIcon: {
        true: ["ms-[10px]"],
        false: [],
      },
      withExtra: {
        true: ["inline-flex", "items-center"],
        false: [],
      },
      /** inline 收起的一级项：文字宽度归零并淡出。 */
      collapsed: {
        true: ["w-0", "opacity-0", "flex-none", "!ms-0"],
        false: ["flex-auto", "opacity-100"],
      },
    },
    defaultVariants: { withIcon: false, withExtra: false, collapsed: false },
  },
);

export const MENU_LABEL_CLASS = ["flex-auto", "min-w-0", "overflow-hidden", "text-ellipsis"];

export const menuExtraClass = cva(["flex-none", "ms-auto", "ps-[16px]"], {
  variants: {
    theme: {
      light: ["text-on-surface/45"],
      dark: ["text-inverse-on-surface/65"],
    },
  },
  defaultVariants: { theme: "light" },
});

/** inline 收起时无图标一级项：只显示首字符（fontSizeLG 居中）。 */
export const MENU_NOICON_CLASS = ["w-full", "text-center", "text-[16px]"];

// ---- submenu arrow -------------------------------------------------------------
export const menuArrowClass = cva(
  [
    "absolute", "top-1/2", "end-[16px]", "-mt-[7px]", "w-[14px]", "h-[14px]", "text-[14px]", "leading-none",
    "inline-flex", "items-center", "justify-center", "pointer-events-none",
    "transition-[rotate,opacity]", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      /** inline：关闭朝下、展开朝上；vertical / popup：朝右。 */
      direction: {
        down: [],
        up: ["rotate-180"],
        right: ["-rotate-90"],
      },
      collapsed: {
        true: ["opacity-0"],
        false: ["opacity-100"],
      },
    },
    defaultVariants: { direction: "down", collapsed: false },
  },
);

// ---- group / divider -----------------------------------------------------------
export const menuGroupTitleClass = cva(
  ["box-border", "px-[16px]", "py-[8px]", "text-[14px]", "leading-[1.5714]", "transition-upthrust", "cursor-default"],
  {
    variants: {
      theme: {
        light: ["text-on-surface/45"],
        dark: ["text-inverse-on-surface/65"],
      },
      inset: {
        root: [],
        /** inline 子级分组标题：padding-inline-start 32px（paddingXL）。 */
        "inline-sub": ["ps-[32px]"],
        /** inline 收起：省略号 + 8px 左右 padding。 */
        collapsed: ["px-[8px]", "overflow-hidden", "text-ellipsis", "whitespace-nowrap"],
      },
    },
    defaultVariants: { theme: "light", inset: "root" },
  },
);

export const MENU_GROUP_CLASS = ["list-none", "m-0", "p-0"];
export const MENU_GROUP_LIST_CLASS = ["list-none", "m-0", "p-0"];

export const menuDividerClass = cva(
  ["list-none", "overflow-hidden", "leading-[0]", "h-0", "p-0", "my-[1px]", "mx-0", "border-0", "border-t"],
  {
    variants: {
      theme: {
        light: ["border-outline-variant"],
        dark: ["border-inverse-on-surface/15"],
      },
      dashed: {
        true: ["border-dashed"],
        false: ["border-solid"],
      },
    },
    defaultVariants: { theme: "light", dashed: false },
  },
);

// ---- inline sub list ---------------------------------------------------------
/** inline 子列表的折叠容器：grid-template-rows 0fr ↔ 1fr 过渡高度。 */
export const menuInlineCollapseClass = cva(["grid", "transition-[grid-template-rows]", "duration-slow", "ease-upthrust"], {
  variants: {
    open: {
      true: ["grid-rows-[1fr]"],
      false: ["grid-rows-[0fr]"],
    },
  },
  defaultVariants: { open: false },
});

export const menuInlineListClass = cva(["m-0", "p-0", "list-none", "min-h-0", "overflow-hidden"], {
  variants: {
    theme: {
      light: ["bg-on-surface/2"],
      dark: ["bg-black/25"],
    },
  },
  defaultVariants: { theme: "light" },
});

// ---- popup ---------------------------------------------------------------------
/**
 * 弹出层外壳（由 createTrigger 定位）。与 antd 一致：朝向触发器的一侧留 8px 透明 padding，
 * 让鼠标从标题移入弹层时 hover 区域连续；原点随实际方位变化。
 */
export const menuPopupLayerClass = cva(
  ["box-border", "outline-none", "transition-overlay", "duration-mid", "ease-upthrust"],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95", "pointer-events-none"],
      },
      placement: {
        bottomLeft: ["origin-top-left", "pt-[8px]"],
        bottomRight: ["origin-top-right", "pt-[8px]"],
        bottom: ["origin-top", "pt-[8px]"],
        topLeft: ["origin-bottom-left", "pb-[8px]"],
        topRight: ["origin-bottom-right", "pb-[8px]"],
        top: ["origin-bottom", "pb-[8px]"],
        rightTop: ["origin-top-left", "ps-[8px]"],
        rightBottom: ["origin-bottom-left", "ps-[8px]"],
        right: ["origin-left", "ps-[8px]"],
        leftTop: ["origin-top-right", "pe-[8px]"],
        leftBottom: ["origin-bottom-right", "pe-[8px]"],
        left: ["origin-right", "pe-[8px]"],
      },
    },
    defaultVariants: { visible: false, placement: "rightTop" },
  },
);

export const menuPopupListClass = cva(
  [
    "m-0", "p-0", "list-none", "box-border", "text-[14px]", "rounded-lg", "min-w-[160px]",
    "max-h-[calc(100vh-100px)]", "overflow-x-hidden", "overflow-y-auto", "outline-none",
    "shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
  ],
  {
    variants: {
      theme: {
        light: ["bg-surface", "text-on-surface"],
        dark: ["bg-inverse-surface", "text-inverse-on-surface/65"],
      },
    },
    defaultVariants: { theme: "light" },
  },
);
