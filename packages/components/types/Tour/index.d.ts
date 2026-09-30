import { JSX } from '@solidjs/web';
import { TourConfig, TourStepConfig, TourIns } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type TourSemanticSlot = 'root' | 'cover' | 'mask' | 'section' | 'footer' | 'actions' | 'indicator' | 'indicators' | 'header' | 'title' | 'description';
export type TourSemanticClassNames = Partial<Record<TourSemanticSlot, string>>;
export type TourSemanticStyles = Partial<Record<TourSemanticSlot, JSX.CSSProperties>>;
export interface TourSemanticInfo {
    props: TourProps;
}
/** antd nextButtonProps / prevButtonProps。 */
export interface TourButtonProps {
    children?: JSX.Element;
    onClick?: () => void;
    class?: string;
    style?: JSX.CSSProperties;
}
/** closable 对象：可带 closeIcon 与 aria-* 属性（透传到关闭按钮）。 */
export type TourClosable = boolean | ({
    closeIcon?: JSX.Element;
} & {
    [aria: `aria-${string}`]: string | undefined;
});
export interface TourStep extends TourStepConfig {
    title?: JSX.Element;
    description?: JSX.Element;
    cover?: JSX.Element;
    type?: 'default' | 'primary';
    nextButtonProps?: TourButtonProps;
    prevButtonProps?: TourButtonProps;
    closable?: TourClosable;
    closeIcon?: JSX.Element | boolean;
    class?: string;
    style?: JSX.CSSProperties;
    classNames?: TourSemanticClassNames;
    styles?: TourSemanticStyles;
    /** @deprecated 使用 `nextButtonProps.children`。 */
    nextText?: JSX.Element;
    /** @deprecated 使用 `prevButtonProps.children`。 */
    previousText?: JSX.Element;
}
export interface TourProps extends TourConfig<TourStep>, Omit<TourStepConfig, 'target'> {
    type?: 'default' | 'primary';
    /** 面板宽度，默认 520（max-width: fit-content）。扩展。 */
    width?: number | string;
    /** 默认 1001。 */
    zIndex?: number;
    closable?: TourClosable;
    closeIcon?: JSX.Element | boolean;
    /** Escape 关闭 + ←/→ 切换步骤，默认 true。 */
    keyboard?: boolean;
    /** 点击遮罩关闭（扩展，默认 false）。 */
    maskClosable?: boolean;
    /** 在操作区显示“跳过”（扩展，默认 false）。 */
    showSkip?: boolean;
    skipText?: JSX.Element;
    /** 指示点开关（扩展，默认 true；仅 steps > 1 时渲染）。 */
    showIndicators?: boolean;
    /** @deprecated 使用 `nextButtonProps.children`。 */
    finishText?: JSX.Element;
    indicatorsRender?: (current: number, total: number) => JSX.Element;
    actionsRender?: (originNode: JSX.Element, info: {
        current: number;
        total: number;
    }) => JSX.Element;
    /** @deprecated 使用 `actionsRender`。 */
    footerRender?: (instance: TourIns<TourStep>) => JSX.Element;
    classNames?: SemanticInput<TourSemanticClassNames, TourSemanticInfo>;
    styles?: SemanticInput<TourSemanticStyles, TourSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
}
export type { TourPlacement, TourCloseReason, TourIns, TourGap, TourMaskConfig } from 'upthrust-competence';
declare const Tour: (providedProps: TourProps) => JSX.Element;
export default Tour;
