// @unocss-include
import { cva } from "class-variance-authority";

// antd 6 Alert 实测：flex 居中、8px 12px、8px 圆角、1px 实线边框；14px / 1.5714 行高，文字色 colorText。
// 有描述：顶端对齐、20px 24px。banner：无边框无圆角。filled：边框透明。
export const alertClass = cva(
  ["relative", "flex", "m-0", "p-0", "break-words", "rounded-lg", "border", "border-solid", "text-[14px]", "leading-[1.5714285714285714]", "text-on-surface", "list-none"],
  {
    variants: {
      // 类型 × 变体合并为一个键（UnoCSS 需要字面量）。成功 / 警告 / 错误用 antd 实测色，信息跟随主色。
      tone: {
        "outlined-success": ["bg-[#f6ffed]", "border-[#b7eb8f]"],
        "outlined-info": ["bg-primary/10", "border-primary/45"],
        "outlined-warning": ["bg-[#fffbe6]", "border-[#ffe58f]"],
        "outlined-error": ["bg-[#fff2f0]", "border-[#ffccc7]"],
        "filled-success": ["bg-[#f6ffed]", "border-transparent"],
        "filled-info": ["bg-primary/10", "border-transparent"],
        "filled-warning": ["bg-[#fffbe6]", "border-transparent"],
        "filled-error": ["bg-[#fff2f0]", "border-transparent"],
      },
      withDescription: {
        true: ["items-start", "py-[20px]", "px-[24px]"],
        false: ["items-center", "py-[8px]", "px-[12px]"],
      },
      banner: {
        true: ["mb-0", "!border-0", "rounded-none"],
        false: [],
      },
      // 离场：antd motion-leave-active 的 margin-bottom: 0 !important。
      leaving: {
        true: ["!mb-0"],
        false: [],
      },
    },
    defaultVariants: { tone: "outlined-info", withDescription: false, banner: false, leaving: false },
  },
);

// wrapper 设为 flex：内层 anticon 成为 flex item，不受 vertical-align 基线偏移影响（antd 的 .ant-alert-icon 本身就是 flex item）。
export const alertIconClass = cva(["flex", "leading-[0]"], {
  variants: {
    type: {
      success: ["text-[#52c41a]"],
      info: ["text-primary"],
      warning: ["text-[#faad14]"],
      error: ["text-[#ff4d4f]"],
    },
    withDescription: {
      true: ["me-[12px]", "text-[24px]"],
      false: ["me-[8px]"],
    },
  },
  defaultVariants: { type: "info", withDescription: false },
});

// 内置图标：antd .anticon（inline-flex、行高 0、vertical-align -0.125em、svg inline-block）。
export const alertBuiltinIconClass = "inline-flex items-center leading-[0] align-[-0.125em] [&>svg]:inline-block";

export const alertSectionClass = "flex-1 min-w-0";

export const alertTitleClass = cva(["text-on-surface"], {
  variants: {
    withDescription: {
      true: ["block", "mb-[8px]", "text-[16px]"],
      false: [],
    },
  },
  defaultVariants: { withDescription: false },
});

// 错误类型下描述里的 <pre>（ErrorBoundary 堆栈）去掉默认外边距。
export const alertDescriptionClass = cva(["block", "text-[14px]", "leading-[1.5714285714285714]", "text-on-surface"], {
  variants: {
    type: {
      error: ["[&>pre]:m-0", "[&>pre]:p-0"],
      success: [],
      info: [],
      warning: [],
    },
  },
  defaultVariants: { type: "info" },
});

export const alertActionsClass = "ms-[8px]";

// 关闭按钮：ms 8px、12px 图标、无边框透明底；键盘聚焦描边同 antd genFocusStyle（4px colorPrimaryBorder、offset 1px）。
export const alertCloseClass = [
  "ms-[8px]", "p-0", "overflow-hidden", "text-[12px]", "leading-[12px]", "bg-transparent", "border-none", "cursor-pointer",
  "focus-visible:outline-4", "focus-visible:outline-solid", "focus-visible:outline-primary/45", "focus-visible:outline-offset-1",
].join(" ");

// 默认关闭图标颜色：colorIcon → colorIconHover。
export const alertCloseIconClass = `${alertBuiltinIconClass} text-on-surface/45 hover:text-on-surface transition-colors duration-200`;
