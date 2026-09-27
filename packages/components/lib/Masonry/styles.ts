// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";

/**
 * 根容器。mode：
 * - grid：首次测量前的回退布局（SSR / 首帧），等宽网格、各项按自然高度顶部对齐；
 * - absolute：测量完成后，各项绝对定位，容器高度由组件按最高列写入。
 */
export const masonryVariants = cva(
  ["upthrust-masonry", "box-border", "w-full"],
  {
    variants: {
      mode: {
        grid: ["grid", "items-start"],
        absolute: ["relative"],
      },
    },
    defaultVariants: { mode: "grid" },
  },
);

/**
 * 单项。state：
 * - static：网格回退阶段，交给 grid 排布；
 * - placed：已测量，left / top 变化时 0.3s 缓出过渡（列数、间距、高度变化时平滑重排）；
 * - pending：布局就绪后新加入、尚未测量的项，透明且不过渡，测量后切到 placed 淡入。
 */
export const masonryItemVariants = cva(
  ["upthrust-masonry-item", "box-border"],
  {
    variants: {
      state: {
        static: ["min-w-0"],
        placed: [
          "absolute",
          "[transition:left_0.3s_cubic-bezier(0.215,0.61,0.355,1),top_0.3s_cubic-bezier(0.215,0.61,0.355,1),opacity_0.3s_cubic-bezier(0.215,0.61,0.355,1)]",
          "motion-reduce:transition-none",
        ],
        pending: ["absolute", "opacity-0"],
      },
    },
    defaultVariants: { state: "static" },
  },
);

export type MasonryItemState = NonNullable<VariantProps<typeof masonryItemVariants>["state"]>;
