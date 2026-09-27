import { JSX } from '@solidjs/web';
import { AlertClosableConfig, AlertType, AlertVariant } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type { AlertType, AlertVariant };
export type AlertClosable = AlertClosableConfig<MouseEvent, JSX.Element>;
export interface AlertSemanticClassNames {
    root?: string;
    icon?: string;
    section?: string;
    title?: string;
    description?: string;
    actions?: string;
    close?: string;
}
export interface AlertSemanticStyles {
    root?: JSX.CSSProperties;
    icon?: JSX.CSSProperties;
    section?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    description?: JSX.CSSProperties;
    actions?: JSX.CSSProperties;
    close?: JSX.CSSProperties;
}
/** 函数形式收到合并后的 props（type / variant / showIcon / closable 已按默认规则推导）。 */
export interface AlertSemanticInfo {
    props: AlertProps & {
        type: AlertType;
        variant: AlertVariant;
        showIcon: boolean;
        closable: boolean;
    };
}
export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'class' | 'style' | 'role' | 'onClose'> {
    /** 类型，默认 'info'；banner 模式默认 'warning'。 */
    type?: AlertType;
    /** 样式变体，默认 'outlined'；'filled' 无边框。 */
    variant?: AlertVariant;
    /** 可关闭配置：true 显示默认关闭按钮；对象可设置 closeIcon / onClose / afterClose 与 aria-* / data-*。 */
    closable?: boolean | AlertClosable;
    /** 警告提示内容。 */
    title?: JSX.Element;
    /** @deprecated 请使用 title。 */
    message?: JSX.Element;
    /** 辅助性文字介绍。 */
    description?: JSX.Element;
    /** 是否显示图标；默认 false，banner 模式默认 true。 */
    showIcon?: boolean;
    /** 自定义图标，showIcon 为 true 时有效。 */
    icon?: JSX.Element;
    /** 用作顶部公告（无边框、无圆角）。 */
    banner?: boolean;
    /** 自定义操作项。 */
    action?: JSX.Element;
    /** @deprecated 请使用 closable.onClose。 */
    onClose?: (e: MouseEvent) => void;
    /** @deprecated 请使用 closable.afterClose。 */
    afterClose?: () => void;
    /** @deprecated 请使用 closable.closeIcon。 */
    closeIcon?: JSX.Element;
    /** @deprecated 请使用 closable.closeIcon。 */
    closeText?: JSX.Element;
    /** 默认 'alert'。 */
    role?: JSX.HTMLAttributes<HTMLDivElement>['role'];
    classNames?: SemanticInput<AlertSemanticClassNames, AlertSemanticInfo>;
    styles?: SemanticInput<AlertSemanticStyles, AlertSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (el: HTMLDivElement) => void;
}
export interface AlertErrorBoundaryProps {
    /** 自定义错误标题；未指定时显示错误信息。 */
    title?: JSX.Element;
    /** @deprecated 请使用 title。 */
    message?: JSX.Element;
    /** 自定义错误内容；未指定时显示错误堆栈。 */
    description?: JSX.Element;
    id?: string;
    children?: JSX.Element;
}
declare const Alert: ((rawProps: AlertProps) => JSX.Element) & {
    ErrorBoundary: (props: AlertErrorBoundaryProps) => JSX.Element;
};
export default Alert;
