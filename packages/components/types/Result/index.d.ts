import { JSX } from '@solidjs/web';
import { SemanticInput } from '../../common/semantic';
export type ResultExceptionStatus = 403 | 404 | 500 | '403' | '404' | '500';
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | ResultExceptionStatus;
export interface ResultSemanticClassNames {
    root?: string;
    icon?: string;
    title?: string;
    subTitle?: string;
    extra?: string;
    body?: string;
}
export interface ResultSemanticStyles {
    root?: JSX.CSSProperties;
    icon?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    subTitle?: JSX.CSSProperties;
    extra?: JSX.CSSProperties;
    body?: JSX.CSSProperties;
}
export interface ResultSemanticInfo {
    props: ResultProps;
}
export interface ResultProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'class' | 'style'> {
    /** 结果状态，决定图标与颜色；403 / 404 / 500 显示异常插图。默认 'info'。 */
    status?: ResultStatus;
    title?: JSX.Element;
    subTitle?: JSX.Element;
    /** 自定义图标；传 null / false 隐藏（异常状态始终显示插图）。 */
    icon?: JSX.Element | null | false;
    /** 操作区。 */
    extra?: JSX.Element;
    /** 补充内容区（body）。 */
    children?: JSX.Element;
    classNames?: SemanticInput<ResultSemanticClassNames, ResultSemanticInfo>;
    styles?: SemanticInput<ResultSemanticStyles, ResultSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
}
/** 与 antd 一致的异常插图静态属性。 */
declare const _default: ((rawProps: ResultProps) => JSX.Element) & {
    PRESENTED_IMAGE_403: () => JSX.Element;
    PRESENTED_IMAGE_404: () => JSX.Element;
    PRESENTED_IMAGE_500: () => JSX.Element;
};
export default _default;
