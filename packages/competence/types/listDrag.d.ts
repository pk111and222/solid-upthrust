/**
 * Headless drag-reorder state machine for list rows — the headless half of
 * what antd6 Listy demos hand to dnd-kit. The machine owns:
 *
 *   1. Pointer semantics — dragStart/dragMove/dragEnd fed from pointer
 *      events (the renderer owns capture and hit-testing).
 *   2. Hover target resolution — which row index the dragged item would
 *      land on (before/after by movement direction, Listy/dnd-kit parity).
 *   3. Keyboard reordering (a11y) — Space arms a row, arrows move it.
 *   4. Commit — `move()` produces the new item order; the renderer writes
 *      it back into its items signal. No DOM, fully unit-testable.
 *
 * The drag IMAGE (the floating ghost) is deliberately NOT here — rendering
 * is the UI layer's business; the machine only tracks state.
 */
export type ListDragConfig<T = unknown> = {
    items: () => T[];
    /** Unique key per item — used to keep the dragged item identity across renders. */
    rowKey?: (item: T, index: number) => string | number;
    /** Fired on commit with the reordered array; the consumer writes it back. */
    onMove?: (items: T[], from: number, to: number) => void;
    /** Lock drag along this axis for hit-testing hints (renderer concern mostly). */
    disabled?: () => boolean;
    /** Pointer travel (px) before the drag activates — separates click from drag. Default 4. */
    activationThreshold?: number;
};
export type ListDragIns<T = unknown> = {
    /** Index of the row currently being dragged (-1 when idle). */
    draggingIndex: () => number;
    /** Key of the dragged item (rowKey form) — stable across reorders. */
    draggingKey: () => string | number | undefined;
    /** Index the dragged item would land on if dropped now (-1 when idle). */
    overIndex: () => number;
    /** True while a drag session is active (pointer is down and moved). */
    isDragging: () => number | false;
    dragStart: (index: number) => boolean;
    /** Report the row under the pointer; updates overIndex with direction bias. */
    dragOver: (index: number) => boolean;
    dragEnd: () => boolean;
    dragCancel: () => void;
    /** Arm a row on pointerdown; activates after activationThreshold px of travel. */
    pointerDown: (index: number, y: number) => 'armed' | 'none';
    /** Feed pointermove Y; 'active' once the threshold has been crossed. */
    pointerMove: (y: number) => 'active' | 'idle';
    /** Release: commits an active drag, disarms a mere press. Returns drop-animation duration (ms). */
    pointerUp: (y: number) => number;
    /** Escape / pointercancel. Returns fly-back duration (ms). */
    pointerCancel: () => number;
    /** 渲染层 drop 动画播完后调用；dropping/cancelling → idle。 */
    settle: () => void;
    /** Space/Enter on a handle: arm (start) or commit a pending keyboard move. */
    keyboardToggle: (index: number) => 'armed' | 'moved' | 'none';
    /** Arrow keys while armed move the pending target; returns the new over index. */
    keyboardMove: (index: number, dir: -1 | 1) => number;
    /** Commit the pending keyboard move. */
    keyboardCommit: () => boolean;
    /** The reordered array the current session WOULD produce (peek). */
    previewItems: () => T[];
    /** Compute the moved array (pure). */
    move: (from: number, to: number) => T[];
    /** 指针会话相位（idle/arming/dragging/dropping/cancelling）。 */
    phase: () => 'idle' | 'arming' | 'dragging' | 'dropping' | 'cancelling';
    /** How far the pointer has moved since the drag started (px; 0 idle). */
    dragOffsetY: () => number;
    /** drop/cancel 动画建议时长（ms；0 = 无动画）。 */
    dropDuration: () => number;
};
export declare const listDragSplits: (keyof ListDragConfig)[];
export declare const createListDrag: <T = unknown>(config: ListDragConfig<T>) => ListDragIns<T>;
