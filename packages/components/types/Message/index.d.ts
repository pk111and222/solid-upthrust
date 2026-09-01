import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { MessagePlacement, MessageType } from 'upthrust-competence';
export type { MessagePlacement, MessageType } from 'upthrust-competence';
/** imperative open() options — content plus overrides for the manager defaults. */
export interface MessageOpenProps {
    content: JSX.Element;
    type?: MessageType;
    /** ms before auto-close; 0 disables. Default 3000 (loading: never). */
    duration?: number;
    /** Unique key: reopening with the same key updates in place. */
    key?: string | number;
}
/** Result handle returned by message.info(...) etc. */
export interface MessageResult {
    key: string;
    /** Update the live notice in place (content/type/duration). */
    update: (patch: Partial<Omit<MessageOpenProps, 'key'>>) => void;
    /** Start the leave animation and remove the notice. */
    close: () => void;
}
/**
 * Renders the global message stack. Mount ONCE, high in the tree (usually in
 * the app root): every imperative call routes into the page-wide singleton
 * queue that this provider displays.
 */
export declare const MessageProvider: Component<{
    /** Reroute stack placement and defaults for all future notifications. */
    placement?: MessagePlacement;
    duration?: number;
    maxCount?: number;
    class?: string;
}>;
/** Global imperative API — usable without any provider import. */
export declare const message: {
    open: (props: MessageOpenProps | JSX.Element) => MessageResult;
    info: (props: MessageOpenProps | JSX.Element) => MessageResult;
    success: (props: MessageOpenProps | JSX.Element) => MessageResult;
    warning: (props: MessageOpenProps | JSX.Element) => MessageResult;
    error: (props: MessageOpenProps | JSX.Element) => MessageResult;
    loading: (props: MessageOpenProps | JSX.Element) => MessageResult;
    /** Close every open notice (starts leave animations). */
    destroy: () => void;
    /** Close one notice by key (starts its leave animation). */
    close: (key: string) => void;
};
export default message;
