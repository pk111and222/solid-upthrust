import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { MessagePlacement, MessageType } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type { MessagePlacement, MessageType } from 'upthrust-competence';
export interface MessageSemanticClassNames {
    /** The fixed list holder. */
    list?: string;
    /** The flex column inside the list. */
    listContent?: string;
    /** One notice card. */
    root?: string;
    /** Icon + title row inside the card. */
    wrapper?: string;
    icon?: string;
    title?: string;
}
export interface MessageSemanticStyles {
    list?: JSX.CSSProperties;
    listContent?: JSX.CSSProperties;
    root?: JSX.CSSProperties;
    wrapper?: JSX.CSSProperties;
    icon?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
}
export interface MessageSemanticInfo {
    props: MessageArgsProps;
}
/** antd ArgsProps — the object form of every open call. */
export interface MessageArgsProps {
    content: JSX.Element;
    /** Seconds before auto-close; 0 / null = never. Default 3 (message.config). */
    duration?: number | null;
    type?: MessageType;
    /** Fired when the notice closes (countdown, result() or destroy(key)); not by destroy(). */
    onClose?: () => void;
    /** Custom icon; replaces the type icon. */
    icon?: JSX.Element;
    /** Unique key: reopening with the same key updates in place. */
    key?: string | number;
    class?: string;
    style?: JSX.CSSProperties;
    classNames?: SemanticInput<MessageSemanticClassNames, MessageSemanticInfo>;
    styles?: SemanticInput<MessageSemanticStyles, MessageSemanticInfo>;
    onClick?: (e: MouseEvent) => void;
    /** Pause the countdown while hovered. Default true. */
    pauseOnHover?: boolean;
}
/** @deprecated Use MessageArgsProps. */
export type MessageOpenProps = MessageArgsProps;
/** Content node, or the full args object. */
export type MessageJointContent = JSX.Element | MessageArgsProps;
/**
 * antd MessageType: call it to close the notice; `.then` resolves (true) once it has closed.
 * `key` / `update` / `close` are kept from the previous API.
 */
export interface MessageResult extends PromiseLike<boolean> {
    (): void;
    key: string;
    promise: Promise<boolean>;
    /** Update the live notice in place; the countdown restarts. */
    update: (patch: Partial<Omit<MessageArgsProps, 'key'>>) => void;
    close: () => void;
}
export type MessageTypeOpen = (content: MessageJointContent, duration?: number | null | (() => void), onClose?: () => void) => MessageResult;
/** message.config / MessageProvider / useMessage options. */
export interface MessageConfigOptions {
    /** Distance from the viewport top (bottom for placement="bottom"), px. Default 8. */
    top?: number;
    /** Default auto-close delay, seconds. Default 3. */
    duration?: number;
    /** Most notices shown at once; the oldest are dropped first. Default unlimited. */
    maxCount?: number;
    /** Default true. */
    pauseOnHover?: boolean;
    /** Render the list into this node (still fixed to the viewport). */
    getContainer?: () => HTMLElement;
    /** Library extension: stack anchor. Default 'top'. */
    placement?: MessagePlacement;
    classNames?: SemanticInput<MessageSemanticClassNames, MessageSemanticInfo>;
    styles?: SemanticInput<MessageSemanticStyles, MessageSemanticInfo>;
}
export interface MessageProviderProps extends MessageConfigOptions {
    /** Extra class on the list holder. */
    class?: string;
}
export interface MessageInstance {
    open: (args: MessageArgsProps) => MessageResult;
    info: MessageTypeOpen;
    success: MessageTypeOpen;
    warning: MessageTypeOpen;
    error: MessageTypeOpen;
    loading: MessageTypeOpen;
    /** With a key: close that notice. Without: close every notice. */
    destroy: (key?: string | number) => void;
}
/**
 * Renders the global message stack. Mount it once high in the tree to keep
 * notices inside a ConfigProvider theme scope; without any provider the first
 * imperative call mounts a fallback holder on document.body (antd static parity).
 */
export declare const MessageProvider: Component<MessageProviderProps>;
/** Global imperative API — usable without mounting a provider. */
export declare const message: {
    config: (options: MessageConfigOptions) => void;
    useMessage: (options?: MessageProviderProps) => readonly [MessageInstance, JSX.Element];
    /** Close one notice by key (alias of destroy(key)). */
    close: (key: string | number) => void;
    open: (args: MessageArgsProps) => MessageResult;
    info: MessageTypeOpen;
    success: MessageTypeOpen;
    warning: MessageTypeOpen;
    error: MessageTypeOpen;
    loading: MessageTypeOpen;
    /** With a key: close that notice. Without: close every notice. */
    destroy: (key?: string | number) => void;
};
export default message;
