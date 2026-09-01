// @unocss-include
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

// ---- container / header -----------------------------------------------------

const descriptionsRootVariants = cva(
  ["w-full", "text-[14px]", "text-on-surface"],
  { variants: {}, defaultVariants: {} }
);

// Header: title left, extra right (antd titleMarginBottom 20 ≈ pb below header).
const descriptionsHeaderVariants = cva(
  ["flex", "items-center", "justify-between", "gap-[12px]", "pt-[16px]", "pb-[8px]"],
  { variants: {}, defaultVariants: {} }
);

const descriptionsTitleVariants = cva(
  ["text-[16px]", "font-medium", "text-on-surface", "leading-[22px]"],
  { variants: {}, defaultVariants: {} }
);

const descriptionsExtraVariants = cva(
  ["flex", "items-center", "gap-[8px]", "text-[14px]"],
  { variants: {}, defaultVariants: {} }
);

// ---- view wrapper + table ----------------------------------------------------
// antd wraps the table in `<prefixCls>-view`: width 100%, borderRadiusLG —
// and in bordered mode the BORDER lives on the view (a frame around the whole
// grid), while rows carry border-b + cells carry border-e hairlines.
const descriptionsViewVariants = cva(
  ["w-full"],
  {
    variants: {
      bordered: {
        true: ["border", "border-solid", "border-outline-variant", "rounded-lg", "overflow-hidden"],
        false: [],
      },
    },
    defaultVariants: { bordered: false },
  }
);

// antd table element: minWidth 100%, border-collapse, tableLayout FIXED —
// EXCEPT bordered mode which switches to tableLayout: auto so label tracks
// shrink to content (that's what makes antd's bordered label columns narrow).
const descriptionsTableVariants = cva(
  ["w-full", "border-collapse"],
  {
    variants: {
      bordered: {
        true: [],
        false: ["table-fixed"],
      },
    },
    defaultVariants: { bordered: false },
  }
);

// ---- bordered horizontal: <th> label | <td> content pairs --------------------
// Label cells: gray bg (antd labelBg ≈ colorFillAlter → surface-variant),
// hairline borders on the row (bottom) and cell (inline-end); antd drops the
// last row's border-b and the last cell's border-e — the frame around the
// whole grid lives on the view wrapper instead.
const descriptionsBorderedLabelVariants = cva(
  [
    "border-solid", "border-outline-variant",
    "bg-surface-variant", "text-on-surface-variant",
    "font-normal", "text-left", "align-top",
    "px-[16px]", "leading-[22px]", "break-words",
  ],
  {
    variants: {
      size: {
        small: ["text-[13px]", "py-[8px]"],
        middle: ["text-[14px]", "py-[12px]"],
        large: ["text-[16px]", "py-[16px]"],
      },
      lastRow: { true: [], false: ["border-b"] },
      lastCell: { true: [], false: ["border-e"] },
    },
    defaultVariants: { size: "middle", lastRow: false, lastCell: false },
  }
);

const descriptionsBorderedContentVariants = cva(
  [
    "border-solid", "border-outline-variant",
    "bg-surface", "text-on-surface",
    "text-left", "align-top",
    "px-[16px]", "leading-[22px]", "break-words",
  ],
  {
    variants: {
      size: {
        small: ["text-[13px]", "py-[8px]"],
        middle: ["text-[14px]", "py-[12px]"],
        large: ["text-[16px]", "py-[16px]"],
      },
      lastRow: { true: [], false: ["border-b"] },
      lastCell: { true: [], false: ["border-e"] },
    },
    defaultVariants: { size: "middle", lastRow: false, lastCell: false },
  }
);

// ---- default (non-bordered) horizontal: one <td> per item ---------------------
// Label + content live in the same cell (antd itemPaddingBottom 16). Labels are
// content-width — antd never aligns label widths across rows in default mode.
const descriptionsItemCellVariants = cva(
  ["align-top", "leading-[22px]", "break-words"],
  {
    variants: {
      size: {
        small: ["text-[13px]", "pb-[12px]"],
        middle: ["text-[14px]", "pb-[16px]"],
        large: ["text-[16px]", "pb-[24px]"],
      },
    },
    defaultVariants: { size: "middle" },
  }
);

// Inline label/content inside a default-mode cell. Label pr = antd
// colonMarginRight 8; colon sits flush after the label (colonMarginLeft 2).
const descriptionsLabelSpanVariants = cva(
  ["text-on-surface-variant", "pr-[8px]"],
  { variants: {}, defaultVariants: {} }
);

const descriptionsContentSpanVariants = cva(
  ["text-on-surface", "pr-[16px]"],
  { variants: {}, defaultVariants: {} }
);

const descriptionsColonVariants = cva(
  ["pl-[2px]"],
  { variants: {}, defaultVariants: {} }
);

// ---- vertical: label <tr> + content <tr> per logical row ---------------------
// antd vertical: each packed row renders a full row of labels, then a full row
// of contents beneath. Bordered draws cell hairlines (labels get the gray bg);
// default stacks them borderless.
const descriptionsVerticalLabelVariants = cva(
  ["font-normal", "text-left", "align-top", "leading-[22px]", "break-words"],
  {
    variants: {
      bordered: {
        true: [
          "border-solid", "border-outline-variant", "border-e",
          "bg-surface-variant", "text-on-surface-variant", "px-[16px]", "py-[8px]",
        ],
        false: ["text-on-surface-variant", "pb-[4px]"],
      },
      size: {
        small: ["text-[13px]"],
        middle: ["text-[14px]"],
        large: ["text-[16px]"],
      },
      // antd: `td/th:last-child` drops borderInlineEnd — only the bordered
      // variant carries border-e in the first place, so plain mode stays clean.
      lastCell: { true: ["[border-inline-end-width:0]"], false: [] },
    },
    defaultVariants: { bordered: false, size: "middle", lastCell: false },
  }
);

const descriptionsVerticalContentVariants = cva(
  ["text-left", "align-top", "text-on-surface", "leading-[22px]", "break-words"],
  {
    variants: {
      bordered: {
        true: ["border-solid", "border-outline-variant", "border-e", "px-[16px]", "py-[12px]"],
        false: ["pb-[16px]"],
      },
      size: {
        small: ["text-[13px]"],
        middle: ["text-[14px]"],
        large: ["text-[16px]"],
      },
      lastCell: { true: ["[border-inline-end-width:0]"], false: [] },
    },
    defaultVariants: { bordered: false, size: "middle", lastCell: false },
  }
);

// antd vertical bordered: the border-b lives on the ROW (not each cell) and
// only between logical rows — applied via a <tr> class so both label and
// content rows share the hairline.
const descriptionsVerticalRowBorderVariants = cva(
  ["border-solid", "border-b", "border-outline-variant"],
  { variants: {}, defaultVariants: {} }
);

export const descriptionsRootClass = (variants: VariantProps<typeof descriptionsRootVariants>) =>
  twMerge(descriptionsRootVariants(variants))
export const descriptionsHeaderClass = (variants: VariantProps<typeof descriptionsHeaderVariants>) =>
  twMerge(descriptionsHeaderVariants(variants))
export const descriptionsTitleClass = (variants: VariantProps<typeof descriptionsTitleVariants>) =>
  twMerge(descriptionsTitleVariants(variants))
export const descriptionsExtraClass = (variants: VariantProps<typeof descriptionsExtraVariants>) =>
  twMerge(descriptionsExtraVariants(variants))
export const descriptionsViewClass = (variants: VariantProps<typeof descriptionsViewVariants>) =>
  twMerge(descriptionsViewVariants(variants))
export const descriptionsTableClass = (variants: VariantProps<typeof descriptionsTableVariants>) =>
  twMerge(descriptionsTableVariants(variants))
export const descriptionsBorderedLabelClass = (variants: VariantProps<typeof descriptionsBorderedLabelVariants>) =>
  twMerge(descriptionsBorderedLabelVariants(variants))
export const descriptionsBorderedContentClass = (variants: VariantProps<typeof descriptionsBorderedContentVariants>) =>
  twMerge(descriptionsBorderedContentVariants(variants))
export const descriptionsItemCellClass = (variants: VariantProps<typeof descriptionsItemCellVariants>) =>
  twMerge(descriptionsItemCellVariants(variants))
export const descriptionsLabelSpanClass = (variants: VariantProps<typeof descriptionsLabelSpanVariants>) =>
  twMerge(descriptionsLabelSpanVariants(variants))
export const descriptionsContentSpanClass = (variants: VariantProps<typeof descriptionsContentSpanVariants>) =>
  twMerge(descriptionsContentSpanVariants(variants))
export const descriptionsColonClass = (variants: VariantProps<typeof descriptionsColonVariants>) =>
  twMerge(descriptionsColonVariants(variants))
export const descriptionsVerticalLabelClass = (variants: VariantProps<typeof descriptionsVerticalLabelVariants>) =>
  twMerge(descriptionsVerticalLabelVariants(variants))
export const descriptionsVerticalContentClass = (variants: VariantProps<typeof descriptionsVerticalContentVariants>) =>
  twMerge(descriptionsVerticalContentVariants(variants))
export const descriptionsVerticalRowBorderClass = (variants: VariantProps<typeof descriptionsVerticalRowBorderVariants>) =>
  twMerge(descriptionsVerticalRowBorderVariants(variants))
