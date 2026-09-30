import { VariantProps } from 'class-variance-authority';
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
declare const spinRootVariants: (props?: ({
    mode?: "section" | "nested" | "fullscreen-on" | "fullscreen-off" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinSectionVariants: (props?: ({
    fullscreen?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinDescriptionVariants: (props?: ({
    fullscreen?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinHolderVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    hidden?: boolean | null | undefined;
    progress?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinDotVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinDotItemVariants: (props?: ({
    position?: "1" | "2" | "3" | "4" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinCustomIndicatorVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinCircleVariants: (props?: ({
    rail?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const spinContainerVariants: (props?: ({
    spinning?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const spinRootClass: (variants: VariantProps<typeof spinRootVariants>) => string;
export declare const spinSectionClass: (variants: VariantProps<typeof spinSectionVariants>) => string;
export declare const spinDescriptionClass: (variants: VariantProps<typeof spinDescriptionVariants>) => string;
export declare const spinHolderClass: (variants: VariantProps<typeof spinHolderVariants>) => string;
export declare const spinDotClass: (variants: VariantProps<typeof spinDotVariants>) => string;
export declare const spinDotItemClass: (variants: VariantProps<typeof spinDotItemVariants>) => string;
export declare const spinCustomIndicatorClass: (variants: VariantProps<typeof spinCustomIndicatorVariants>) => string;
export declare const spinCircleClass: (variants: VariantProps<typeof spinCircleVariants>) => string;
export declare const spinContainerClass: (variants: VariantProps<typeof spinContainerVariants>) => string;
/** Every variant combination, for dead-class tests. */
export declare const spinClassMatrix: () => string[];
export {};
