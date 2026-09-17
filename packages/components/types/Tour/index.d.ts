import { JSX } from '@solidjs/web';
import { TourConfig, TourStepConfig, TourIns } from 'upthrust-competence';
export interface TourStep extends TourStepConfig {
    title?: JSX.Element;
    description?: JSX.Element;
    cover?: JSX.Element;
    type?: 'default' | 'primary';
    nextText?: JSX.Element;
    previousText?: JSX.Element;
}
export interface TourProps extends TourConfig<TourStep>, Omit<TourStepConfig, 'target'> {
    type?: 'default' | 'primary';
    width?: number;
    zIndex?: number;
    closable?: boolean;
    keyboard?: boolean;
    maskClosable?: boolean;
    showSkip?: boolean;
    showIndicators?: boolean;
    finishText?: JSX.Element;
    skipText?: JSX.Element;
    indicatorsRender?: (current: number, total: number) => JSX.Element;
    footerRender?: (instance: TourIns<TourStep>) => JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
export type { TourPlacement, TourCloseReason, TourIns } from 'upthrust-competence';
declare const Tour: (providedProps: TourProps) => JSX.Element;
export default Tour;
