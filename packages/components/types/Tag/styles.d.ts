/**
 * antd 6 Tag：12px 字号、20px 行高、左右 7px 内边距 + 1px 边框（总高 22px）、4px 圆角。
 * 颜色矩阵按「变体-颜色」合并为一个 tone 键（UnoCSS 只能静态扫描 variants 的字面量）。
 * 预设色板取 antd 色板第 1/3/6/7 级：filled/outlined 用 1 级底、7 级字，outlined 加 3 级边，solid 用 6 级底白字。
 */
export declare const tagClass: (props?: ({
    tone?: "solid-default" | "outlined-default" | "filled-default" | "outlined-success" | "outlined-warning" | "outlined-error" | "filled-success" | "filled-warning" | "filled-error" | "outlined-blue" | "outlined-red" | "outlined-green" | "filled-blue" | "filled-red" | "filled-green" | "solid-success" | "filled-processing" | "outlined-processing" | "solid-processing" | "solid-error" | "solid-warning" | "solid-blue" | "filled-purple" | "outlined-purple" | "solid-purple" | "filled-cyan" | "outlined-cyan" | "solid-cyan" | "solid-green" | "filled-magenta" | "outlined-magenta" | "solid-magenta" | "filled-pink" | "outlined-pink" | "solid-pink" | "solid-red" | "filled-orange" | "outlined-orange" | "solid-orange" | "filled-yellow" | "outlined-yellow" | "solid-yellow" | "filled-volcano" | "outlined-volcano" | "solid-volcano" | "filled-geekblue" | "outlined-geekblue" | "solid-geekblue" | "filled-lime" | "outlined-lime" | "solid-lime" | "filled-gold" | "outlined-gold" | "solid-gold" | "filled-custom" | "outlined-custom" | "solid-custom" | "disabled-filled" | "disabled-outlined" | "disabled-solid" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 图标与文字间距 7px（antd `> .anticon + span`），图标取 1em。 */
export declare const tagIconClass = "inline-flex items-center shrink-0 [&>*]:shrink-0";
export declare const tagContentClass = "ms-[7px] min-w-0";
/** 关闭按钮：10px 图标、左侧 3px；原生 button 提供 Tab/Enter/Space。 */
export declare const tagCloseClass: (props?: ({
    state?: "disabled" | "normal" | "solid" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkableTagClass: (props?: ({
    state?: "checked" | "unchecked" | "disabled-unchecked" | "disabled-checked" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const checkableTagGroupClass = "flex flex-wrap gap-xs";
