import { TourRect, TourStepConfig } from './index';
export declare function createTourPosition(config: {
    open: () => boolean;
    step: () => TourStepConfig | undefined;
    panel: () => HTMLElement | undefined;
    defaults: () => TourStepConfig;
}): {
    target: import('solid-js').SourceAccessor<HTMLElement | undefined>;
    rect: import('solid-js').SourceAccessor<TourRect | undefined>;
    position: import('solid-js').SourceAccessor<{
        left: number;
        top: number;
        placement: import('./index').TourPlacement;
    }>;
};
