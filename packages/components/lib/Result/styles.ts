// @unocss-include
import { cva } from "class-variance-authority";

// antd 6 Result 实测：根 48px 32px 内边距；图标区 mb 24px 居中、图标 72px；
// 标题 24/32 上下 8px；副标题 14/22 次要色；extra mt 24px、子项间距 8px；body mt 24px、24px 40px、colorFillAlter 底。
export const resultClass = cva(["block", "py-[48px]", "px-[32px]", "text-[14px]", "leading-[22px]", "text-on-surface"], {
  variants: {},
  defaultVariants: {},
});

export const resultIconClass = cva(["mb-[24px]", "text-center", "[&>*]:text-[72px]"], {
  variants: {
    status: {
      // 状态色：成功 / 警告 / 错误用 antd 实测色值（MD3 无对应 token），信息跟随主色。
      success: ["text-[#52c41a]"],
      error: ["text-[#ff4d4f]"],
      info: ["text-primary"],
      warning: ["text-[#faad14]"],
      // 异常图：250×295 居中块，颜色不参与。
      image: ["w-[250px]", "h-[295px]", "m-auto"],
    },
  },
  defaultVariants: { status: "info" },
});

// 内置图标：与 antd .anticon 一致（inline-flex、行高 0、vertical-align -0.125em、svg inline-block），图标区高度恰为 72px。
export const resultBuiltinIconClass = "inline-flex items-center leading-[0] align-[-0.125em] [&>svg]:inline-block";

export const resultTitleClass = cva(["my-[8px]", "text-center", "text-[24px]", "leading-[32px]", "text-on-surface"], {
  variants: {},
  defaultVariants: {},
});

export const resultSubtitleClass = cva(["text-center", "text-[14px]", "leading-[22px]", "text-on-surface/45"], {
  variants: {},
  defaultVariants: {},
});

export const resultExtraClass = cva(["mt-[24px]", "text-center", "[&>*]:me-[8px]", "[&>*:last-child]:me-0"], {
  variants: {},
  defaultVariants: {},
});

export const resultBodyClass = cva(["mt-[24px]", "py-[24px]", "px-[40px]", "bg-on-surface/2"], {
  variants: {},
  defaultVariants: {},
});
