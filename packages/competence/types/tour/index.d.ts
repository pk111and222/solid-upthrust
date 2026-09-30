/** rc-tour PlacementType：12 个方位 + 无目标时的 center。 */
export type TourPlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom' | 'center';
export type TourCloseReason = 'close' | 'skip' | 'escape' | 'mask' | 'finish';
/** rc-tour Gap：offset 为高亮区外扩（数字或 [x, y]），radius 为高亮圆角。 */
export interface TourGap {
    offset?: number | [number, number];
    radius?: number;
}
export interface TourMaskConfig {
    style?: object;
    color?: string;
}
export interface TourStepConfig {
    target?: HTMLElement | null | (() => HTMLElement | null | undefined);
    placement?: TourPlacement;
    /** 高亮区外扩与圆角；数字为旧写法，等同 `{ offset: n }`。 */
    gap?: number | TourGap;
    /** @deprecated 使用 `gap.radius`。 */
    radius?: number;
    /** 目标不在视口内时的滚动方式，默认 `{ block: 'center', inline: 'center' }`；false 不滚动。 */
    scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
    /** @deprecated 使用 `scrollIntoViewOptions`。 */
    scrollIntoView?: boolean | ScrollIntoViewOptions;
    mask?: boolean | TourMaskConfig;
    arrow?: boolean | {
        pointAtCenter: boolean;
    };
    disabledInteraction?: boolean;
}
export interface TourConfig<T extends TourStepConfig = TourStepConfig> {
    steps: readonly T[];
    open?: boolean;
    defaultOpen?: boolean;
    current?: number;
    defaultCurrent?: number;
    onOpenChange?: (open: boolean) => void;
    onChange?: (current: number, previous: number) => void;
    onClose?: (current: number, reason: TourCloseReason) => void;
    onFinish?: (current: number) => void;
    beforeChange?: (next: number, current: number) => boolean | void | Promise<boolean | void>;
    onError?: (error: unknown) => void;
}
export declare function createTour<T extends TourStepConfig>(config: TourConfig<T>): {
    open: import('solid-js').SourceAccessor<boolean>;
    current: import('solid-js').SourceAccessor<number>;
    step: () => T;
    pending: import('solid-js').SourceAccessor<boolean>;
    setOpen: (value: boolean) => void;
    close: (reason?: TourCloseReason) => void;
    goTo: (next: number) => Promise<boolean>;
    next: () => Promise<boolean>;
    previous: () => Promise<boolean>;
};
export type TourIns<T extends TourStepConfig = TourStepConfig> = ReturnType<typeof createTour<T>>;
export interface TourRect {
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface TourArrow {
    x: number;
    y: number;
    side: 'top' | 'bottom' | 'left' | 'right';
}
export interface TourPosition {
    left: number;
    top: number;
    placement: TourPlacement;
    arrow?: TourArrow;
}
/** rc-tour useTarget 的 gap 归一：offset 默认 6（可分 x / y），radius 默认 2；数字 gap 为旧写法。 */
export declare function tourGap(gap: number | TourGap | undefined, legacyRadius?: number): {
    x: number;
    y: number;
    radius: number;
};
/**
 * rc-tour useClosable：步骤级 closable / closeIcon 优先于 Tour 级；closable=false 或 closeIcon=false（且对象未给图标）时为 null（不可关闭，
 * 同时屏蔽 Escape）。Tour 级默认可关闭。
 */
export declare function tourClosable<I>(stepClosable: boolean | ({
    closeIcon?: I;
} & object) | undefined, stepCloseIcon: I | boolean | undefined, closable: boolean | ({
    closeIcon?: I;
} & object) | undefined, closeIcon: I | boolean | undefined): ({
    closeIcon?: I;
} & object) | null;
/**
 * 纯函数定位：目标（高亮区）外 `offset`（antd：半箭头 8 + marginXXS 4 = 12）处放置面板，
 * 首选方向溢出更多时翻到对侧（保持对齐方式），再夹在视口 8px 边距内；无目标或 center 时居中。
 * 箭头落在面板朝向目标的一边、跟随目标中心（夹在圆角之外）；pointAtCenter 时 xxLeft / xxTop 等对齐方位平移面板让箭头贴边 12px 指向目标中心。
 */
export declare function placeTour(target: TourRect | undefined, panel: {
    width: number;
    height: number;
}, viewport: {
    width: number;
    height: number;
}, placement?: TourPlacement, offset?: number, pointAtCenter?: boolean): TourPosition;
export { createTourPosition } from './position';
