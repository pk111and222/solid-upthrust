import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { NotificationPlacement, NotificationType } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type { NotificationPlacement, NotificationType } from 'upthrust-competence';
export interface NotificationSemanticClassNames {
    /** The notice card. */
    root?: string;
    title?: string;
    description?: string;
    actions?: string;
    icon?: string;
}
export interface NotificationSemanticStyles {
    root?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    description?: JSX.CSSProperties;
    actions?: JSX.CSSProperties;
    icon?: JSX.CSSProperties;
}
export interface NotificationSemanticInfo {
    props: NotificationArgsProps;
}
/** closable object form: custom icon, extra close callback and aria-* for the close button. */
export interface NotificationClosableConfig {
    closeIcon?: JSX.Element | null | false;
    /** Fires before `onClose` whenever the notice closes. */
    onClose?: () => void;
    'aria-label'?: string;
    [aria: `aria-${string}`]: string | undefined;
}
/** antd ArgsProps — the object form of every open call. */
export interface NotificationArgsProps {
    title?: JSX.Element;
    /** @deprecated Use `title`. */
    message?: JSX.Element;
    description?: JSX.Element;
    /** Action area (usually buttons), floated right under the description. */
    actions?: JSX.Element;
    /** @deprecated Use `actions`. */
    btn?: JSX.Element;
    /** Custom icon; replaces the type icon. */
    icon?: JSX.Element;
    type?: NotificationType;
    /** Unique key: reopening with the same key replaces the notice in place. */
    key?: string | number;
    /** Seconds before auto-close; 0 / null / false = never. Default 4.5 (notification.config). */
    duration?: number | null | false;
    /** Show the countdown progress bar. */
    showProgress?: boolean;
    /** Pause the countdown while hovered. Default true. */
    pauseOnHover?: boolean;
    placement?: NotificationPlacement;
    /** Fired when this notice closes (countdown, × or destroy(key)); not by destroy(). */
    onClose?: () => void;
    onClick?: (e: MouseEvent) => void;
    /** Custom close icon; null / false hides the close button. */
    closeIcon?: JSX.Element | null | false;
    /** Default true. */
    closable?: boolean | NotificationClosableConfig;
    /** ARIA role of the content. Default 'alert'. */
    role?: JSX.HTMLAttributes<HTMLDivElement>['role'];
    /** Extra DOM attributes on the notice card. */
    props?: JSX.HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string>;
    class?: string;
    style?: JSX.CSSProperties;
    classNames?: SemanticInput<NotificationSemanticClassNames, NotificationSemanticInfo>;
    styles?: SemanticInput<NotificationSemanticStyles, NotificationSemanticInfo>;
}
/** @deprecated Use NotificationArgsProps. */
export type NotificationOpenProps = NotificationArgsProps;
/** Result handle returned by open / info / … (library extension; antd returns void). */
export interface NotificationResult {
    key: string;
    /** Update the live notice in place; the countdown restarts. */
    update: (patch: Partial<Omit<NotificationArgsProps, 'key'>>) => void;
    /** Start the leave animation and remove the notice (fires onClose). */
    close: () => void;
}
/** notification.config / NotificationProvider / useNotification options. */
export interface NotificationConfigOptions {
    /** Default placement. Default 'topRight'. */
    placement?: NotificationPlacement;
    /** Distance of the top stacks from the viewport top, px. Default 24. */
    top?: number;
    /** Distance of the bottom stacks from the viewport bottom, px. Default 24. */
    bottom?: number;
    /** Default auto-close delay, seconds; 0 / null / false = never. Default 4.5. */
    duration?: number | null | false;
    showProgress?: boolean;
    /** Default true. */
    pauseOnHover?: boolean;
    /** Most notices shown at once; the oldest are dropped first. Default unlimited. */
    maxCount?: number;
    /** Collapse a corner into a card stack beyond `threshold` (default 3) notices. Default true. */
    stack?: boolean | {
        threshold?: number;
    };
    /** Render the lists into this node (still fixed to the viewport). */
    getContainer?: () => HTMLElement;
    closeIcon?: JSX.Element | null | false;
    closable?: boolean | NotificationClosableConfig;
    classNames?: SemanticInput<NotificationSemanticClassNames, NotificationSemanticInfo>;
    styles?: SemanticInput<NotificationSemanticStyles, NotificationSemanticInfo>;
}
export interface NotificationProviderProps extends NotificationConfigOptions {
    /** Extra class on every placement list. */
    class?: string;
}
export interface NotificationInstance {
    open: (args: NotificationArgsProps) => NotificationResult;
    info: (args: NotificationArgsProps) => NotificationResult;
    success: (args: NotificationArgsProps) => NotificationResult;
    warning: (args: NotificationArgsProps) => NotificationResult;
    error: (args: NotificationArgsProps) => NotificationResult;
    /** With a key: close that notice. Without: close every notice. */
    destroy: (key?: string | number) => void;
}
/**
 * Renders the global notification lists — one per placement that has notices.
 * Mount it once high in the tree to keep notices inside a ConfigProvider theme
 * scope; without any provider the first imperative call mounts a fallback
 * holder on document.body (antd static parity).
 */
export declare const NotificationProvider: Component<NotificationProviderProps>;
/** Global imperative API — usable without mounting a provider. */
export declare const notification: {
    config: (options: NotificationConfigOptions) => void;
    useNotification: (options?: NotificationProviderProps) => readonly [NotificationInstance, JSX.Element];
    /** Close one notice by key (alias of destroy(key)). */
    close: (key: string | number) => void;
    open: (args: NotificationArgsProps) => NotificationResult;
    info: (args: NotificationArgsProps) => NotificationResult;
    success: (args: NotificationArgsProps) => NotificationResult;
    warning: (args: NotificationArgsProps) => NotificationResult;
    error: (args: NotificationArgsProps) => NotificationResult;
    /** With a key: close that notice. Without: close every notice. */
    destroy: (key?: string | number) => void;
};
export default notification;
