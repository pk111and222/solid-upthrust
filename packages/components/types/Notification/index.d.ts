import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { NotificationPlacement, NotificationType } from 'upthrust-competence';
export type { NotificationPlacement, NotificationType } from 'upthrust-competence';
/** imperative open() options — antd ArgsProps surface. */
export interface NotificationOpenProps {
    message: JSX.Element;
    description?: JSX.Element;
    icon?: JSX.Element;
    btn?: JSX.Element;
    type?: NotificationType;
    /** Seconds before auto-close; 0 disables. Default 4.5 (manager default). */
    duration?: number | null;
    /** Show the countdown progress bar. */
    showProgress?: boolean;
    /** Pause the countdown while the pointer rests on the notice. Default true. */
    pauseOnHover?: boolean;
    /** Unique key: reopening with the same key updates in place. */
    key?: string | number;
    placement?: NotificationPlacement;
    onClose?: () => void;
}
/** Result handle returned by notification.open(...) etc. */
export interface NotificationResult {
    key: string;
    /** Update the live notice in place. */
    update: (patch: Partial<Omit<NotificationOpenProps, 'key'>>) => void;
    /** Start the leave animation and remove the notice. */
    close: () => void;
}
/**
 * Renders the global notification stacks — all six placements at once. Mount
 * ONCE, high in the tree: every imperative call routes into the page-wide
 * singleton this provider displays.
 */
export declare const NotificationProvider: Component<{
    placement?: NotificationPlacement;
    duration?: number | null;
    showProgress?: boolean;
    pauseOnHover?: boolean;
    maxCount?: number;
    class?: string;
}>;
/** Global imperative API — antd notification.xxx(config) surface. */
export declare const notification: {
    open: (props: NotificationOpenProps) => NotificationResult;
    info: (props: NotificationOpenProps) => NotificationResult;
    success: (props: NotificationOpenProps) => NotificationResult;
    warning: (props: NotificationOpenProps) => NotificationResult;
    error: (props: NotificationOpenProps) => NotificationResult;
    /** Close every open notice (starts leave animations). */
    destroy: () => void;
    /** Close one notice by key (starts its leave animation). */
    close: (key: string) => void;
};
export default notification;
