// @unocss-include
import { cva } from "class-variance-authority";

// antd 6 QRCode 实测：flex 居中、padding 12px、1px colorSplit 边框、8px 圆角、border-box；
// 无边框时边框透明、padding 0、圆角 0。宽高与背景色走内联 style。
export const qrCodeClass = cva(
  ["relative", "flex", "justify-center", "items-center", "overflow-hidden", "box-border", "text-[14px]", "leading-[22px]", "text-on-surface"],
  {
    variants: {
      bordered: {
        true: ["p-[12px]", "border", "border-solid", "border-on-surface/6", "rounded-lg"],
        false: ["p-0", "border", "border-solid", "border-transparent", "rounded-none"],
      },
    },
    defaultVariants: { bordered: true },
  },
);

// canvas 与 svg 都在 flex 里拉伸：canvas 按 antd `> canvas { align-self: stretch; flex: auto; min-width: 0 }`。
export const qrCanvasClass = "self-stretch flex-auto min-w-0 block";
export const qrSvgClass = "block";

// 遮罩：绝对铺满、z-10、纵向居中、colorBgContainer 96% 不透明。
export const qrCoverClass = cva(
  ["absolute", "top-0", "start-0", "z-10", "flex", "flex-col", "justify-center", "items-center", "w-full", "h-full", "text-on-surface", "leading-[22px]", "text-center", "bg-surface/96"],
  { variants: {}, defaultVariants: {} },
);

export const qrStatusTextClass = "m-0 text-on-surface";
