/**
 * antd 6.6.5 Badge 几何：数字高 20px（small 14px）、字号 12px、最小宽度等于高度，
 * 多字符左右 8px；点 6px；1px 表面色描边（badgeShadowColor = colorBorderBg）。
 * 颜色键合并状态、预设色板与本库 gray 扩展，全部以字面量列在 variants 中供 UnoCSS 扫描。
 * 预设色板取 antd 色板第 6 级（darkColor）。
 */
export declare const badgeRootClass: (props?: ({
    mode?: "status" | "wrapped" | "standalone" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const badgeCountClass: (props?: ({
    anchor?: "wrapped" | "standalone" | null | undefined;
    size?: "small" | "middle" | null | undefined;
    color?: "error" | "warning" | "success" | "default" | "blue" | "cyan" | "gold" | "gray" | "green" | "lime" | "magenta" | "orange" | "pink" | "purple" | "red" | "yellow" | "primary" | "custom" | "processing" | "volcano" | "geekblue" | null | undefined;
    words?: boolean | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const badgeDotClass: (props?: ({
    anchor?: "wrapped" | "standalone" | null | undefined;
    color?: "error" | "warning" | "success" | "default" | "blue" | "cyan" | "gold" | "gray" | "green" | "lime" | "magenta" | "orange" | "pink" | "purple" | "red" | "yellow" | "primary" | "custom" | "processing" | "volcano" | "geekblue" | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const badgeCustomClass: (props?: ({
    anchor?: "wrapped" | "standalone" | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const badgeStatusDotClass: (props?: ({
    color?: "error" | "warning" | "success" | "default" | "blue" | "cyan" | "gold" | "gray" | "green" | "lime" | "magenta" | "orange" | "pink" | "purple" | "red" | "yellow" | "primary" | "custom" | "processing" | "volcano" | "geekblue" | null | undefined;
    processing?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const badgeStatusTextClass = "ms-[8px] text-[14px] text-on-surface leading-[inherit]";
export declare const ribbonClass: (props?: ({
    placement?: "start" | "end" | null | undefined;
    color?: "blue" | "cyan" | "gold" | "gray" | "green" | "lime" | "magenta" | "orange" | "pink" | "purple" | "red" | "yellow" | "primary" | "custom" | "volcano" | "geekblue" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const ribbonContentClass = "text-[#fff]";
export declare const ribbonWrapperClass = "relative";
