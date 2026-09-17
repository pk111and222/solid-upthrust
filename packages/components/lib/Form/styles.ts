// @unocss-include
import { twMerge } from "tailwind-merge"

/**
 * Form styles — antd6 form spec:
 *  - horizontal (default): label fixed column, right-aligned, colon ::after;
 *    control flex-1 minWidth 0 (genHorizontalStyle)
 *  - vertical: label above, padding 0 0 8px, colon hidden (makeVerticalLayoutLabel)
 *  - size (genFormSize): label height + control minHeight = controlHeight family
 *  - required asterisk: colorError, marginInlineEnd 4px, ::before (label style)
 *  - colon: marginInlineStart 2px / marginInlineEnd 8px (labelColonMargin*)
 *  - explain: colorTextDescription, error → colorError, warning → colorWarning
 *  - feedback icon: zoomIn entrance, 4 status colors (feedback-icon style)
 *  - item bottom margin: marginLG 24px (itemMarginBottom)
 */

export const formClass = (class_?: string) =>
  twMerge(['w-full', 'text-[14px]', 'text-on-surface'], class_)

/**
 * Item row. horizontal: `flex items-start` with the label column and the
 * control column as flex children (antd Row > Col structure flattened);
 * vertical: `flex-col` — label stacks above the control.
 */
export const formItemClass = (opts: {
  layout?: 'horizontal' | 'vertical' | 'inline'
  hidden?: boolean
  class_?: string
} = {}) =>
  twMerge(
    [
      'mb-md',
      'relative',
      ...(opts.layout === 'vertical' ? ['flex', 'flex-col'] : []),
      ...(opts.layout === 'horizontal' ? ['flex', 'items-start'] : []),
      ...(opts.hidden ? ['hidden'] : []),
    ],
    opts.class_,
  )

/**
 * Label column (horizontal mode). flexGrow 0 / overflow hidden / nowrap /
 * textAlign end — antd's form-item-label. The inner <label> is inline-flex
 * with the size's control height so the label text centers on the control's
 * first line (antd: `> label { height: labelHeight }`).
 *
 * The fixed column WIDTH is applied as an inline style by Item.tsx (a CSS
 * length like '96px' cannot be a static UnoCSS class — arbitrary-value
 * classes built at runtime are invisible to the extractor).
 */
export const formItemLabelWrapClass = (opts: {
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelAlign?: 'left' | 'right'
  labelWrap?: boolean
  class_?: string
} = {}) =>
  twMerge(
    [
      'flex',
      'grow-0',
      'shrink-0',
      // overflow:hidden + nowrap per antd label; wrap mode relaxes both
      opts.labelWrap ? 'overflow-visible whitespace-normal leading-[1.5714]' : 'overflow-hidden whitespace-nowrap',
      ...(opts.layout === 'vertical'
        ? ['w-full', 'text-start', 'pt-0', 'px-0', 'pb-xs']
        : [
            opts.labelAlign === 'left' ? 'text-start' : 'text-end',
            'pr-xs',
          ]),
    ],
    opts.class_,
  )

/**
 * The <label> element itself. antd: inline-flex, alignItems center,
 * maxWidth 100%, height labelHeight (= controlHeight per size).
 */
export const formItemLabelClass = (opts: { size?: 'small' | 'middle' | 'large'; class_?: string } = {}) =>
  twMerge(
    [
      'relative',
      'inline-flex',
      'items-center',
      'max-w-full',
      'text-[14px]',
      'text-on-surface',
      'cursor-auto',
      opts.size === 'small' ? 'h-control-sm' : opts.size === 'large' ? 'h-control-lg' : 'h-control',
    ],
    opts.class_,
  )

/** required `*` — antd ::before: inline-block, marginInlineEnd 4px, colorError. */
export const formItemRequiredMarkClass = (hidden?: boolean) =>
  twMerge(
    [
      'inline-block',
      'text-error',
      'text-[14px]',
      'font-sans',
      'leading-none',
      'mr-[4px]',
      'select-none',
      ...(hidden ? ['hidden'] : []),
    ],
  )

/**
 * optional `(optional)` hint — antd optional mark: marginInlineStart 4px,
 * colorTextDescription. Rendered only under requiredMark='optional'.
 */
export const formItemOptionalMarkClass = () =>
  twMerge(['inline-block', 'ml-[4px]', 'text-on-surface-variant'])

/** colon `:` — antd ::after: marginInlineStart 2px, marginInlineEnd 8px. */
export const formItemColonClass = () =>
  twMerge(['relative', 'ml-[2px]', 'mr-[8px]', 'select-none'])

/** label tooltip question mark — colorTextDescription, cursor help, 4px gap. */
export const formItemTooltipClass = () =>
  twMerge(['ml-[4px]', 'text-on-surface-variant', 'text-[14px]', 'cursor-help'])

/**
 * Control column (horizontal): flex '1 1 0' + minWidth 0 — the antd
 * genHorizontalStyle control rule. Vertical mode just spans full width.
 */
export const formItemControlClass = (opts: { layout?: 'horizontal' | 'vertical' | 'inline'; class_?: string } = {}) =>
  twMerge(
    [
      'flex',
      'flex-col',
      'grow',
      'min-w-0',
      ...(opts.layout === 'horizontal' ? ['flex-1', 'basis-0'] : []),
    ],
    opts.class_,
  )

/**
 * control-input — antd: relative, flex, alignItems center, minHeight
 * controlHeight (per size — this is how Form size resizes widgets).
 */
export const formItemControlInputClass = (opts: { size?: 'small' | 'middle' | 'large' } = {}) =>
  twMerge(
    [
      'relative',
      'flex',
      'items-center',
      opts.size === 'small' ? 'min-h-control-sm' : opts.size === 'large' ? 'min-h-control-lg' : 'min-h-control',
    ],
  )

/** control-input-content — flex auto, maxWidth 100%. */
export const formItemControlContentClass = () => twMerge(['flex-auto', 'max-w-full'])

/**
 * Explain row (validation messages / help). antd: clear both,
 * colorTextDescription, error → colorError, warning → colorWarning.
 * No min-height: antd collapses the row entirely when empty (CSSMotion),
 * and mb-md on the item already reserves the rhythm.
 */
export const formItemExplainClass = (status: 'error' | 'warning' | 'default' = 'default') =>
  twMerge(
    [
      'clear-both',
      'text-[14px]',
      'leading-[1.5714]',
      'pt-[2px]',
      status === 'error' ? 'text-error' : '',
      status === 'warning' ? 'text-[#faad14]' : '',
      status === 'default' ? 'text-on-surface-variant' : '',
    ],
  )

/**
 * Explain item entrance — antd show-help-item: overflow hidden,
 * translateY(-5px)→0 + fade, height/opacity/transform at motionDurationFast.
 */
export const formItemExplainItemClass = () =>
  twMerge(['animate-form-explain-item'])

/** extra row — colorTextDescription, minHeight controlHeightSM (24px). */
export const formItemExtraClass = () =>
  twMerge(['text-[14px]', 'leading-[1.5714]', 'min-h-[24px]', 'text-on-surface-variant'])

/**
 * Feedback icon — antd feedback-icon: zoomIn entrance, fontSize, centered,
 * pointer-events none; color per status (success #52c41a / error colorError /
 * warning #faad14 / validating colorPrimary). Rendered in the control's
 * suffix area (right edge, vertically centered on the control height).
 */
export const formItemFeedbackIconClass = (status: 'error' | 'warning' | 'validating' | 'success' | undefined) =>
  twMerge(
    [
      'absolute',
      'right-[11px]',
      'top-0',
      'flex',
      'items-center',
      'text-[14px]',
      'text-center',
      'pointer-events-none',
      'animate-feedback-zoom-in',
      status === 'error' ? 'text-error' : '',
      status === 'warning' ? 'text-[#faad14]' : '',
      status === 'success' ? 'text-[#52c41a]' : '',
      status === 'validating' ? 'text-primary' : '',
    ],
  )

/** feedback icon vertical centering rides the control height per size. */
export const formItemFeedbackIconWrapClass = (opts: { size?: 'small' | 'middle' | 'large' } = {}) =>
  twMerge([
    'flex',
    'items-center',
    opts.size === 'small' ? 'h-control-sm' : opts.size === 'large' ? 'h-control-lg' : 'h-control',
  ])

export const formListRowClass = (class_?: string) => twMerge(['flex', 'items-start', 'gap-xs', 'w-full'], class_)

export const formListRemoveBtnClass = () =>
  twMerge(['mt-[4px]', 'flex', 'items-center', 'justify-center', 'h-control', 'text-on-surface-variant', 'hover:text-error', 'transition-upthrust-fast', 'cursor-pointer'])

export const formListAddBtnClass = () => twMerge(['w-full'])
