/**
 * Headless logic for Message — a GLOBAL SINGLETON notification queue.
 *
 * The design center of this module (vs. every other competence module):
 * there is exactly ONE message manager per page, shared by all callers.
 * Components never instantiate it — they consume the singleton through
 * `getMessageManager()`. That is what makes the imperative API possible:
 * `message.info('...')` from anywhere routes into the same queue that the
 * single `<MessageProvider />` (mounted once, high in the tree) renders.
 *
 * Owns:
 *  - the notification queue (insertion order = stacking order, top-aligned)
 *  - per-notification lifecycle: open → (optional update) → leave → remove
 *  - leave-animation sequencing (a close marks the item `closing`; the
 *    RENDERER removes it from the DOM when the animation ends via `remove`)
 *  - max-count trimming and manual/global close
 *
 * Deliberately does NOT own: DOM, portals, timers for auto-close (duration
 * is enforced by the renderer's timeout → `close`, so the headless layer
 * stays testable without fake clocks for the queue semantics).
 */
export type MessagePlacement = 'top' | 'bottom' | 'center';
export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';
export type MessageConfig = {
    content: unknown;
    type?: MessageType;
    /** ms before auto-close; 0 = never auto-close. Default handled by the renderer. */
    duration?: number;
    /** Unique key: updating reuses the existing slot instead of stacking a new one. */
    key?: string | number;
};
export type MessageItem = {
    key: string;
    type: MessageType;
    content: unknown;
    /**
     * Auto-close delay in ms (0 = never). Stored per item so update() can
     * change it; the RENDERER owns the timer itself — the headless layer
     * never schedules anything.
     */
    duration?: number;
    /** Monotonic per-item revision — bumped by `update`, read by the renderer to re-run the enter animation. */
    revision: number;
    /** False once close() is called; the renderer plays the leave animation then calls remove(). */
    closing: boolean;
};
export type MessageIns = {
    /** Snapshot of the queue in stacking order. */
    items: () => MessageItem[];
    /** Open (or update, when `key` matches) a notification. Returns its key. */
    open: (config: MessageConfig) => string;
    /** Update content/type of an existing notification by key. No-op if absent. */
    update: (key: string, patch: Partial<Omit<MessageConfig, 'key'>>) => boolean;
    /** Start the leave animation for one (or all, without a key) notifications. */
    close: (key?: string) => void;
    /** Remove an item from the queue entirely — called by the renderer AFTER the leave animation ends (or immediately when no animation is wanted). */
    remove: (key: string) => void;
    /** Where the stack anchors. Default 'top'. */
    placement: () => MessagePlacement;
};
export type MessageManager = MessageIns & {
    /** Configuration applied to every notification opened through this manager. */
    configure: (defaults: {
        placement?: MessagePlacement;
        duration?: number;
        maxCount?: number;
    }) => void;
    /** Renderer-read defaults (duration/maxCount are enforced renderer-side). */
    defaults: () => {
        placement: MessagePlacement;
        duration: number;
        maxCount: number;
    };
};
export declare const createMessageManager: () => MessageManager;
/** The page-wide message manager. Creates it on first call. */
export declare const getMessageManager: () => MessageManager;
/**
 * Convenience bound to the singleton — the imperative API surface.
 * `message.open({ content, type: 'success' })` from anywhere.
 */
export declare const message: MessageIns;
export type MessageKey = string;
export declare const messageSplits: (keyof MessageConfig)[];
