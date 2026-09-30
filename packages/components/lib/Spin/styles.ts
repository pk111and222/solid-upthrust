// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

/**
 * antd 6 Spin（spin/style/index.ts）：
 *  - root：resetComponent（14px / colorText / 1.5714）+ relative。独立模式下 root 本身就是 section（inline-flex）。
 *  - section：flex 纵向居中、gap paddingSM（12px）、colorPrimary；嵌套模式绝对居中 z-1。
 *  - description：14px、line-height 1；加载中 text-shadow 0 0 5px colorBgContainer。
 *  - container：opacity 0.3s；::after 白色蒙层 z-10，加载中容器 0.5 透明、蒙层 0.4 并拦截指针。
 *  - fullscreen：fixed 铺满、colorBgMask、zIndexPopupBase 1000、all 0.2s；section / 描述为白色。
 *  - 指示器：dot-holder 1em（14 / 20 / 32px），四点方阵 rotate(45deg) → 405deg 1.2s，
 *    点径 (holder - 2px) / 2、scale(0.75)、opacity 0.3 → 1 交替；progress 为 100×100 viewBox 圆环（描边 20）。
 */
const spinRootVariants = cva(
  ["relative", "box-border", "m-0", "p-0", "text-[14px]", "text-on-surface", "leading-[1.5714]"],
  {
    variants: {
      mode: {
        section: ["inline-flex", "flex-col", "items-center", "gap-sm", "text-primary"],
        nested: [],
        "fullscreen-on": ["fixed", "inset-0", "z-1000", "bg-black/45", "[transition:all_0.2s]", "opacity-100", "pointer-events-auto"],
        "fullscreen-off": ["fixed", "inset-0", "z-1000", "bg-black/45", "[transition:all_0.2s]", "opacity-0", "pointer-events-none"],
      },
    },
    defaultVariants: { mode: "section" },
  }
)

// Section inside a nested / fullscreen root: centred over the container.
const spinSectionVariants = cva(
  ["absolute", "top-1/2", "start-1/2", "-translate-x-1/2", "-translate-y-1/2", "z-1", "flex", "flex-col", "items-center", "gap-sm"],
  {
    variants: {
      fullscreen: { true: ["text-white"], false: ["text-primary"] },
    },
    defaultVariants: { fullscreen: false },
  }
)

const spinDescriptionVariants = cva(
  ["text-[14px]", "leading-none", "[text-shadow:0_0_5px_rgb(var(--upthrust-colors-surface))]"],
  {
    variants: {
      fullscreen: { true: ["text-white"], false: [] },
    },
    defaultVariants: { fullscreen: false },
  }
)

// Dot holder: 1em square at the size's font-size; hidden (scale .3 + fade) once percent > 0.
const spinHolderVariants = cva(
  ["inline-block", "w-[1em]", "h-[1em]", "leading-none", "origin-center", "[transition:transform_0.3s_ease,opacity_0.3s_ease]"],
  {
    variants: {
      size: {
        small: ["text-[14px]"],
        middle: ["text-[20px]"],
        large: ["text-[32px]"],
      },
      hidden: {
        true: ["[transform:scale(0.3)]", "opacity-0"],
        false: [],
      },
      progress: {
        true: ["absolute", "top-0", "start-1/2", "-translate-x-1/2"],
        false: [],
      },
    },
    defaultVariants: { size: "middle", hidden: false, progress: false },
  }
)

const spinDotVariants = cva(
  ["relative", "inline-block", "w-[1em]", "h-[1em]", "[transform:rotate(45deg)]", "animate-spin-dot"],
  { variants: {}, defaultVariants: {} }
)

const spinDotItemVariants = cva(
  [
    "absolute", "block", "w-[calc((1em-2px)/2)]", "h-[calc((1em-2px)/2)]", "rounded-full", "bg-current",
    "[transform:scale(0.75)]", "origin-center", "opacity-30", "animate-spin-dot-item",
  ],
  {
    variants: {
      position: {
        "1": ["top-0", "start-0"],
        "2": ["top-0", "end-0", "[animation-delay:0.4s]"],
        "3": ["bottom-0", "end-0", "[animation-delay:0.8s]"],
        "4": ["bottom-0", "start-0", "[animation-delay:1.2s]"],
      },
    },
    defaultVariants: { position: "1" },
  }
)

// Custom indicator wrapper: font-size carries the size, the node sizes itself (1em icons fit).
const spinCustomIndicatorVariants = cva(
  ["relative", "inline-flex", "items-center", "justify-center", "leading-none"],
  {
    variants: {
      size: {
        small: ["text-[14px]"],
        middle: ["text-[20px]"],
        large: ["text-[32px]"],
      },
    },
    defaultVariants: { size: "middle" },
  }
)

const spinCircleVariants = cva(
  [
    "[stroke-linecap:round]", "[fill-opacity:0]",
    "[transition:stroke-dashoffset_0.3s_ease,stroke-dasharray_0.3s_ease,stroke_0.3s_ease,stroke-width_0.3s_ease,opacity_0.3s_ease]",
  ],
  {
    variants: {
      rail: { true: ["stroke-on-surface/6"], false: ["stroke-current"] },
    },
    defaultVariants: { rail: false },
  }
)

const spinContainerVariants = cva(
  [
    "relative", "[transition:opacity_0.3s]",
    "after:content-empty", "after:absolute", "after:inset-0", "after:z-10", "after:bg-surface", "after:[transition:all_0.3s]",
  ],
  {
    variants: {
      spinning: {
        true: ["opacity-50", "select-none", "pointer-events-none", "after:opacity-40", "after:pointer-events-auto"],
        false: ["after:opacity-0", "after:pointer-events-none"],
      },
    },
    defaultVariants: { spinning: false },
  }
)

export const spinRootClass = (variants: VariantProps<typeof spinRootVariants>) => mergeClass(spinRootVariants(variants))
export const spinSectionClass = (variants: VariantProps<typeof spinSectionVariants>) => mergeClass(spinSectionVariants(variants))
export const spinDescriptionClass = (variants: VariantProps<typeof spinDescriptionVariants>) => mergeClass(spinDescriptionVariants(variants))
export const spinHolderClass = (variants: VariantProps<typeof spinHolderVariants>) => mergeClass(spinHolderVariants(variants))
export const spinDotClass = (variants: VariantProps<typeof spinDotVariants>) => mergeClass(spinDotVariants(variants))
export const spinDotItemClass = (variants: VariantProps<typeof spinDotItemVariants>) => mergeClass(spinDotItemVariants(variants))
export const spinCustomIndicatorClass = (variants: VariantProps<typeof spinCustomIndicatorVariants>) => mergeClass(spinCustomIndicatorVariants(variants))
export const spinCircleClass = (variants: VariantProps<typeof spinCircleVariants>) => mergeClass(spinCircleVariants(variants))
export const spinContainerClass = (variants: VariantProps<typeof spinContainerVariants>) => mergeClass(spinContainerVariants(variants))

/** Every variant combination, for dead-class tests. */
export const spinClassMatrix = (): string[] => {
  const out: string[] = []
  for (const mode of ["section", "nested", "fullscreen-on", "fullscreen-off"] as const) out.push(spinRootClass({ mode }))
  for (const b of [true, false]) {
    out.push(spinSectionClass({ fullscreen: b }), spinDescriptionClass({ fullscreen: b }), spinCircleClass({ rail: b }), spinContainerClass({ spinning: b }))
    for (const size of ["small", "middle", "large"] as const) {
      out.push(spinCustomIndicatorClass({ size }))
      for (const c of [true, false]) out.push(spinHolderClass({ size, hidden: b, progress: c }))
    }
  }
  for (const position of ["1", "2", "3", "4"] as const) out.push(spinDotItemClass({ position }))
  out.push(spinDotClass({}))
  return out
}
