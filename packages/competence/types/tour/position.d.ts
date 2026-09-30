import { TourPosition, TourRect, TourStepConfig } from './index';
export interface TourHighlight extends TourRect {
    radius: number;
}
export declare function createTourPosition(config: {
    open: () => boolean;
    step: () => TourStepConfig | undefined;
    panel: () => HTMLElement | undefined;
    defaults: () => TourStepConfig;
}): {
    target: import('solid-js').SourceAccessor<HTMLElement | undefined>;
    rect: import('solid-js').SourceAccessor<TourHighlight | undefined>;
    position: import('solid-js').SourceAccessor<TourPosition>;
};
