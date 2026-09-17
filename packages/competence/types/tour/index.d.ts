export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TourCloseReason = 'close' | 'skip' | 'escape' | 'mask';
export interface TourStepConfig {
    target?: HTMLElement | null | (() => HTMLElement | null | undefined);
    placement?: TourPlacement;
    gap?: number;
    radius?: number;
    scrollIntoView?: boolean | ScrollIntoViewOptions;
    mask?: boolean;
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
export declare function placeTour(target: TourRect | undefined, panel: {
    width: number;
    height: number;
}, viewport: {
    width: number;
    height: number;
}, placement?: TourPlacement): {
    left: number;
    top: number;
    placement: TourPlacement;
};
export { createTourPosition } from './position';
