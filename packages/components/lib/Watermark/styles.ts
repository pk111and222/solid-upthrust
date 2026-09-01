// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Watermark layer: absolute full-cover, background tile from the headless
// layer, pointer events pass through so the covered content stays usable.
const watermarkLayerVariants = cva(
  ["absolute", "inset-0", "pointer-events-none", "overflow-hidden"],
  { variants: {}, defaultVariants: {} }
)

// Container: relative so the layer positions against it.
const watermarkContainerVariants = cva(
  ["relative"],
  { variants: {}, defaultVariants: {} }
)

export const watermarkLayerClass = (variants: VariantProps<typeof watermarkLayerVariants>) =>
  twMerge(watermarkLayerVariants(variants))
export const watermarkContainerClass = (variants: VariantProps<typeof watermarkContainerVariants>) =>
  twMerge(watermarkContainerVariants(variants))
