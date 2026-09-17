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
export declare const formClass: (class_?: string) => string;
/**
 * Item row. horizontal: `flex items-start` with the label column and the
 * control column as flex children (antd Row > Col structure flattened);
 * vertical: `flex-col` — label stacks above the control.
 */
export declare const formItemClass: (opts?: {
    layout?: "horizontal" | "vertical" | "inline";
    hidden?: boolean;
    class_?: string;
}) => string;
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
export declare const formItemLabelWrapClass: (opts?: {
    layout?: "horizontal" | "vertical" | "inline";
    labelAlign?: "left" | "right";
    labelWrap?: boolean;
    class_?: string;
}) => string;
/**
 * The <label> element itself. antd: inline-flex, alignItems center,
 * maxWidth 100%, height labelHeight (= controlHeight per size).
 */
export declare const formItemLabelClass: (opts?: {
    size?: "small" | "middle" | "large";
    class_?: string;
}) => string;
/** required `*` — antd ::before: inline-block, marginInlineEnd 4px, colorError. */
export declare const formItemRequiredMarkClass: (hidden?: boolean) => string;
/**
 * optional `(optional)` hint — antd optional mark: marginInlineStart 4px,
 * colorTextDescription. Rendered only under requiredMark='optional'.
 */
export declare const formItemOptionalMarkClass: () => string;
/** colon `:` — antd ::after: marginInlineStart 2px, marginInlineEnd 8px. */
export declare const formItemColonClass: () => string;
/** label tooltip question mark — colorTextDescription, cursor help, 4px gap. */
export declare const formItemTooltipClass: () => string;
/**
 * Control column (horizontal): flex '1 1 0' + minWidth 0 — the antd
 * genHorizontalStyle control rule. Vertical mode just spans full width.
 */
export declare const formItemControlClass: (opts?: {
    layout?: "horizontal" | "vertical" | "inline";
    class_?: string;
}) => string;
/**
 * control-input — antd: relative, flex, alignItems center, minHeight
 * controlHeight (per size — this is how Form size resizes widgets).
 */
export declare const formItemControlInputClass: (opts?: {
    size?: "small" | "middle" | "large";
}) => string;
/** control-input-content — flex auto, maxWidth 100%. */
export declare const formItemControlContentClass: () => string;
/**
 * Explain row (validation messages / help). antd: clear both,
 * colorTextDescription, error → colorError, warning → colorWarning.
 * No min-height: antd collapses the row entirely when empty (CSSMotion),
 * and mb-md on the item already reserves the rhythm.
 */
export declare const formItemExplainClass: (status?: "error" | "warning" | "default") => string;
/**
 * Explain item entrance — antd show-help-item: overflow hidden,
 * translateY(-5px)→0 + fade, height/opacity/transform at motionDurationFast.
 */
export declare const formItemExplainItemClass: () => string;
/** extra row — colorTextDescription, minHeight controlHeightSM (24px). */
export declare const formItemExtraClass: () => string;
/**
 * Feedback icon — antd feedback-icon: zoomIn entrance, fontSize, centered,
 * pointer-events none; color per status (success #52c41a / error colorError /
 * warning #faad14 / validating colorPrimary). Rendered in the control's
 * suffix area (right edge, vertically centered on the control height).
 */
export declare const formItemFeedbackIconClass: (status: "error" | "warning" | "validating" | "success" | undefined) => string;
/** feedback icon vertical centering rides the control height per size. */
export declare const formItemFeedbackIconWrapClass: (opts?: {
    size?: "small" | "middle" | "large";
}) => string;
export declare const formListRowClass: (class_?: string) => string;
export declare const formListRemoveBtnClass: () => string;
export declare const formListAddBtnClass: () => string;
