// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Skeleton element base: the shimmering bar. Two visual modes:
//  - active: gradient sweep (animate-skeleton-wave needs the 200% gradient
//    + the two gradient color vars, set via the gradient class's own vars)
//  - static: flat fill
const skeletonElementVariants = cva(
  ["bg-outline-variant/25", "rounded"],
  {
    variants: {
      shape: {
        line: ["h-[16px]"],
        // avatar circles/squares get fixed square dims from the UI layer
        circle: ["rounded-full"],
        square: [],
      },
      active: {
        // Resolve the same outline token as static placeholders in each theme.
        true: [
          "animate-skeleton-wave", "motion-reduce:animate-none",
          "bg-[linear-gradient(90deg,rgb(var(--upthrust-colors-outline-variant)/0.25)_25%,rgb(var(--upthrust-colors-outline-variant)/0.1)_37%,rgb(var(--upthrust-colors-outline-variant)/0.25)_63%)]",
        ],
        false: [],
      },
      round: {
        true: ["rounded-full"],
        false: [],
      },
    },
    defaultVariants: { shape: "line", active: false, round: false },
  }
)

// Paragraph rows: 16px rhythm between lines (antd's li + li margin).
// `first` resets the top margin — set by the UI layer on the FIRST paragraph
// row only (CSS :first-child can't express it: the title, when present,
// precedes the rows inside the same container).
const skeletonRowVariants = cva(
  ["h-[16px]", "mt-[16px]"],
  {
    variants: {
      first: {
        true: ["mt-0"],
        false: [],
      },
    },
    defaultVariants: { first: false },
  }
)

// Title row: 8px breathing room BELOW the title (antd's .ant-skeleton-title
// margin-bottom), so title→first-paragraph is 8px, not the 16px line rhythm.
const skeletonTitleVariants = cva(
  ["h-[16px]", "mb-[8px]"],
  { variants: {}, defaultVariants: {} }
)

// Whole skeleton block: avatar left + text column right.
const skeletonBlockVariants = cva(
  ["flex", "items-start"],
  {
    variants: {
      hasAvatar: {
        // antd avatar→content gap is 16px (paddingInlineStart on content).
        true: ["gap-4"],
        false: [],
      },
    },
    defaultVariants: { hasAvatar: false },
  }
)

const skeletonAvatarVariants = cva(
  ["flex", "shrink-0", "items-center", "bg-outline-variant/25"],
  {
    variants: {
      shape: {
        circle: ["rounded-full"],
        square: ["rounded-sm"],
      },
    },
    defaultVariants: { shape: "circle" },
  }
)

export const skeletonElementClass = (variants: VariantProps<typeof skeletonElementVariants>) =>
  twMerge(skeletonElementVariants(variants))
export const skeletonRowClass = (variants: VariantProps<typeof skeletonRowVariants>) =>
  twMerge(skeletonRowVariants(variants))
export const skeletonTitleClass = (variants: VariantProps<typeof skeletonTitleVariants>) =>
  twMerge(skeletonTitleVariants(variants))
export const skeletonBlockClass = (variants: VariantProps<typeof skeletonBlockVariants>) =>
  twMerge(skeletonBlockVariants(variants))
export const skeletonAvatarClass = (variants: VariantProps<typeof skeletonAvatarVariants>) =>
  twMerge(skeletonAvatarVariants(variants))
