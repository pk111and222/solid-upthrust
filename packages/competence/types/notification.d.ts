/**
 * Headless logic for Notification — a GLOBAL SINGLETON notification system,
 * mirroring the rc-notification / antd semantics that Message deliberately
 * simplified away:
 *
 *  - SIX per-placement queues (topLeft/top/topRight/bottomLeft/bottom/
 *    bottomRight). A notification remembers the placement it was opened
 *    with; switching the manager default only affects FUTURE opens.
 *  - duration is per-item and measured in SECONDS (antd parity: 4.5s
 *    default, 0/null = never auto-close).
 *  - pauseOnHover: the countdown pauses while the pointer rests on the
 *    notice. The headless layer tracks the elapsed budget and reports
 *    `progress()` (0..1) so the renderer can drive a progress bar without
 *    owning any timing state of its own.
 *
 * Design contract with the renderer (same split as Message): the headless
 * layer owns the QUEUE and the CLOSE/REMOVE sequencing (closing flag +
 * removal after the leave animation); the renderer owns timers, hover
 * tracking and every DOM concern.
 */
export type NotificationPlacement = 'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
/** antd ArgsProps subset (message/description/btn/icon + behaviour flags). */
export type NotificationConfig = {
    /** Title line. */
    message: unknown;
    /** Optional body under the title. */
    description?: unknown;
    /** Optional custom icon node replacing the type icon. */
    icon?: unknown;
    /** Optional action area (usually buttons) floated to the right. */
    btn?: unknown;
    type?: NotificationType;
    /** Seconds before auto-close; 0/null = never. Default from manager (4.5s). */
    duration?: number | null;
    /** Show the countdown progress bar. Default from manager. */
    showProgress?: boolean;
    /** Pause the countdown while hovered. Default from manager (true). */
    pauseOnHover?: boolean;
    /** Unique key: reopening with the same key updates in place. */
    key?: string | number;
    /** Which corner stack this notification joins. Default from manager (topRight). */
    placement?: NotificationPlacement;
    /** Fires when the notice is closed (by timer, X, or destroy). */
    onClose?: () => void;
};
export type NotificationItem = {
    key: string;
    type: NotificationType;
    message: unknown;
    description: unknown;
    icon: unknown;
    btn: unknown;
    /** Seconds; 0 = never. Stored per item so update() can change it. */
    duration: number | null;
    showProgress: boolean;
    pauseOnHover: boolean;
    placement: NotificationPlacement;
    onClose?: () => void;
    /** Monotonic revision — bumped by update; the renderer restarts timers/enter on change. */
    revision: number;
    /** False once close() marks the notice; the renderer plays leave then calls remove(). */
    closing: boolean;
};
export type NotificationIns = {
    /** Snapshot of one placement's queue in stacking order. */
    items: (placement: NotificationPlacement) => NotificationItem[];
    /** Flat snapshot across placements (renderers iterate placements). */
    allItems: () => NotificationItem[];
    /** Open (or update, when `key` matches) a notification. Returns its key. */
    open: (config: NotificationConfig) => string;
    /** Update an existing notification by key. No-op if absent. */
    update: (key: string, patch: Partial<Omit<NotificationConfig, 'key'>>) => boolean;
    /** Start the leave animation for one (or all, without a key) notifications. */
    close: (key?: string) => void;
    /** Remove from the queue — called by the renderer AFTER the leave animation. */
    remove: (key: string) => void;
    /** Default placement for new notifications. */
    placement: () => NotificationPlacement;
};
export type NotificationManager = NotificationIns & {
    configure: (defaults: {
        placement?: NotificationPlacement;
        duration?: number | null;
        showProgress?: boolean;
        pauseOnHover?: boolean;
        maxCount?: number;
    }) => void;
    defaults: () => {
        placement: NotificationPlacement;
        duration: number | null;
        showProgress: boolean;
        pauseOnHover: boolean;
        maxCount: number;
    };
};
export declare const NOTIFICATION_PLACEMENTS: NotificationPlacement[];
export declare const createNotificationManager: () => NotificationManager;
/** The page-wide notification manager. Creates it on first call. */
export declare const getNotificationManager: () => NotificationManager;
/**
 * Convenience bound to the singleton — the imperative API surface.
 * `notification.open({ message, type: 'success' })` from anywhere.
 */
export declare const notification: NotificationIns;
export type NotificationKey = string;
export declare const notificationSplits: (keyof NotificationConfig)[];
