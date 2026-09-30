/**
 * Headless logic for Notification — a GLOBAL SINGLETON notification system
 * with rc-notification semantics (antd 6):
 *
 *  - ONE flat queue in open order; each notice carries its placement
 *    (topLeft/top/topRight/bottomLeft/bottom/bottomRight) and the renderer
 *    filters per corner. A same-key reopen REPLACES the config in place — a
 *    new placement therefore moves the notice.
 *  - maxCount trims the OLDEST notices of the whole queue (rc parity), not
 *    per placement. Default unlimited.
 *  - duration is in SECONDS (4.5 default; 0 / null / false = never), resolved
 *    at open time like rc's merged share-config.
 *  - onClose fires when ONE notice closes (countdown, × button, close(key));
 *    closing everything (destroy()) does NOT fire it.
 *  - stack: antd 6 collapses a corner into a card stack beyond `threshold`
 *    (default 3) live notices; `notificationStackLayout` is the pure layout
 *    math (rc NoticeList) so the renderer only measures and applies it.
 *
 * Contract with the renderer (same split as Message): the headless layer owns
 * the QUEUE and the close/remove sequencing (closing flag, removal after the
 * leave animation); the renderer owns timers, hover, measurement and the DOM.
 */
export type NotificationPlacement = 'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
/** antd ArgsProps subset the queue models (presentation lives in `extra`). */
export type NotificationConfig = {
    /** Title line. */
    title?: unknown;
    /** @deprecated Use `title`. */
    message?: unknown;
    description?: unknown;
    /** Custom icon node replacing the type icon. */
    icon?: unknown;
    /** Action area (usually buttons) under the description. */
    actions?: unknown;
    /** @deprecated Use `actions`. */
    btn?: unknown;
    type?: NotificationType;
    /** Seconds before auto-close; 0 / null / false = never. Default from manager (4.5). */
    duration?: number | null | false;
    /** Show the countdown progress bar. Default from manager (false). */
    showProgress?: boolean;
    /** Pause the countdown while hovered. Default from manager (true). */
    pauseOnHover?: boolean;
    /** Unique key: reopening with the same key replaces the notice in place. */
    key?: string | number;
    /** Default from manager (topRight). */
    placement?: NotificationPlacement;
    /** Fires once when this notice closes (countdown, × or close(key)); not by close(). */
    onClose?: () => void;
    /** Renderer-owned presentation bag. */
    extra?: unknown;
};
export type NotificationItem = {
    key: string;
    /** Undefined when opened without a type (no type icon). */
    type?: NotificationType;
    title: unknown;
    description: unknown;
    icon: unknown;
    actions: unknown;
    /** Seconds; 0 = never. */
    duration: number;
    showProgress: boolean;
    pauseOnHover: boolean;
    placement: NotificationPlacement;
    onClose?: () => void;
    extra?: unknown;
    /** Monotonic revision — bumped by a same-key reopen / update; the renderer restarts its countdown on change. */
    revision: number;
    /** True once closed; the renderer plays the leave animation then calls remove(). */
    closing: boolean;
};
export type NotificationDefaults = {
    placement: NotificationPlacement;
    /** Seconds; 0 = never. */
    duration: number;
    showProgress: boolean;
    pauseOnHover: boolean;
    /** 0 = unlimited. */
    maxCount: number;
    /** Distance of the top stacks from the viewport top, px. */
    top: number;
    /** Distance of the bottom stacks from the viewport bottom, px. */
    bottom: number;
    /** Collapse a corner into a card stack. */
    stack: boolean;
    /** Live notices a corner shows expanded before collapsing. */
    threshold: number;
};
export type NotificationIns = {
    /** Live queue of one placement, in open order. */
    items: (placement: NotificationPlacement) => NotificationItem[];
    /** The whole queue, in open order. */
    allItems: () => NotificationItem[];
    /** Open (or replace, when `key` matches) a notification. Returns its key. */
    open: (config: NotificationConfig) => string;
    /** Merge a patch into an existing notification. False if absent. */
    update: (key: string, patch: Partial<Omit<NotificationConfig, 'key'>>) => boolean;
    /** Start the leave animation of one notice (fires onClose) or of every notice (no onClose). */
    close: (key?: string) => void;
    /** Remove from the queue — called by the renderer AFTER the leave animation. */
    remove: (key: string) => void;
    /** Default placement for new notifications. */
    placement: () => NotificationPlacement;
};
export type NotificationManager = NotificationIns & {
    configure: (defaults: Partial<Omit<NotificationDefaults, 'duration'>> & {
        duration?: number | null | false;
    }) => void;
    defaults: () => NotificationDefaults;
};
export declare const NOTIFICATION_PLACEMENTS: NotificationPlacement[];
export declare const NOTIFICATION_DEFAULTS: NotificationDefaults;
export declare const createNotificationManager: () => NotificationManager;
export type NotificationStackBox = {
    height: number;
    width: number;
};
export type NotificationStackStyle = {
    transform: string;
    /** Explicit wrapper height (index > 0 only). */
    height?: number;
};
/**
 * Stack transforms for one corner. `boxes` are the measured notice sizes of
 * the LIVE notices ordered NEWEST FIRST (index 0 hugs the anchor edge).
 * Expanded: every older notice is pushed away from the edge by the heights of
 * the newer ones plus `gap`. Collapsed: older notices peek `offset` px behind
 * the newest, take its height and shrink horizontally by `offset` per side.
 */
export declare const notificationStackLayout: (placement: NotificationPlacement, boxes: NotificationStackBox[], expanded: boolean, offset?: number, gap?: number) => NotificationStackStyle[];
/** The page-wide notification manager. Creates it on first call. */
export declare const getNotificationManager: () => NotificationManager;
/** Convenience bound to the singleton. */
export declare const notification: NotificationIns;
export type NotificationKey = string;
export declare const notificationSplits: (keyof NotificationConfig)[];
