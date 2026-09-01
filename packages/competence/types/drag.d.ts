/**
 * Generic headless drag primitive — the react-beautiful-dnd state model,
 * distilled to a DOM-free state machine.
 *
 * ## Phase 流（生命周期）
 *
 * ```
 * idle ──pointerDown──▶ arming ──threshold──▶ dragging ──release──▶ dropping ──settle──▶ idle
 *                        │                      │                       │
 *                        └──release(未激活)──▶ idle                    └──cancel──▶ cancelling ──▶ idle
 *                                               └──cancel──▶ cancelling
 * ```
 *
 * - `arming`：按下但未越过激活阈值——可能是点击。释放即回 idle 并报告 wasClick。
 * - `dragging`：真拖拽。被拖拽体（draggble）已被提起，位置随指针。
 * - `dropping`：已松手，落点动画进行中。这是 rbd 与普通实现的关键差异——
 *   drop 不是瞬移而是一段按距离动态计时的回弹，动画结束（settle 被调用）才回 idle。
 * - `cancelling`：Escape/pointercancel 触发的取消飞回动画。
 *
 * ## 被拖拽体语义
 *
 * `draggable` = { id, sourceIndex, payload } 在 pointerDown 时登记，
 * 整个会话期间稳定——渲染层据此绑定“哪个实体在飞”。
 *
 * ## 状态快照
 *
 * `state()` 返回完整快照：phase、位移、方向、位移步数（nudge 计数）、
 * 会话 id。所有字段在任意时刻可读且响应式追踪。
 *
 * 渲染层全权负责把状态画出来；本层零 DOM。
 */
export type DragAxis = 'x' | 'y' | 'both';
/** 完整生命周期。 */
export type DragPhase = 'idle' | 'arming' | 'dragging' | 'dropping' | 'cancelling';
export type DragPoint = {
    x: number;
    y: number;
};
/** 被拖拽体：一次会话从一而终的身份描述。 */
export type Draggable<P = unknown> = {
    /** 渲染层自定义 id（如行 key）。 */
    id: string | number;
    /** 拖起时的源位置索引。 */
    sourceIndex: number;
    /** 渲染层自由附加的数据。 */
    payload?: P;
};
/** 指针几何：一次会话内的全部坐标事实。 */
export type DragGeometry = {
    start: DragPoint;
    current: DragPoint;
    /** current − start，轴锁定后。 */
    delta: DragPoint;
    /** 累计行程（px，双轴）。 */
    distance: number;
    /** 激活瞬间的主轴方向；激活前为 null。 */
    direction: 1 | -1 | null;
    /** overIndex 变更次数——rbd 的“nudge”概念，用于位移感知强度。 */
    nudges: number;
};
/** 一次拖拽会话的全量快照。 */
export type DragState<P = unknown> = {
    phase: DragPhase;
    draggable: Draggable<P> | null;
    geometry: DragGeometry;
    /** 松手时的落点几何（dropping/cancelling 阶段才有值）。 */
    release: {
        /** 松手瞬间指针位置。 */
        at: DragPoint;
        /** drop 动画的建议时长（ms）——随距家距离动态，rbd 式加权。 */
        duration: number;
    } | null;
};
export type DragConfig<P = unknown> = {
    /** 指针需移动这么远（px）才算拖拽。默认 5（rbd 用 5px 阈值）。 */
    activationThreshold?: number;
    /** 轴锁定。 */
    axis?: DragAxis;
    /** 禁用整个交互。 */
    disabled?: () => boolean;
    /** drop 动画时长基准：最小值。默认 150ms。 */
    dropDurationMin?: number;
    /** drop 动画时长基准：最大值。默认 350ms（rbd 的动画随距离增长但有上限感）。 */
    dropDurationMax?: number;
    /** 时长增长的距离系数：每 px 行程加这么久，clamp 到 [min, max]。 */
    dropDurationPerPx?: number;
    /** 任意 phase 转移。旧→新，含会话状态。 */
    onPhaseChange?: (from: DragPhase, to: DragPhase, state: DragState<P>) => void;
    /** 阈值越过、被拖拽体被提起的一瞬。 */
    onDragStart?: (state: DragState<P>) => void;
    /** dragging 阶段每次指针移动。 */
    onDragMove?: (state: DragState<P>) => void;
    /** 松手进入 dropping。 */
    onDrop?: (state: DragState<P>) => void;
    /** 取消进入 cancelling。 */
    onDragCancel?: (state: DragState<P>) => void;
    /** dropping/cancelling 动画收尾——渲染层动画播完后调用 settle() 触发。 */
    onSettle?: (state: DragState<P>) => void;
    /** arming 释放（这其实是次点击）。 */
    onClick?: (draggable: Draggable<P>) => void;
};
export type DragIns<P = unknown> = {
    /** 当前生命周期阶段（响应式）。 */
    phase: () => DragPhase;
    /** 便捷判定。 */
    isArming: () => boolean;
    isDragging: () => boolean;
    isDropping: () => boolean;
    isCancelling: () => boolean;
    /** arming || dragging（指针还按着）。 */
    isPointerDown: () => boolean;
    /** 一次会话从提起到落定是否完整发生过（用于“感知被拖拽”）。 */
    isActive: () => boolean;
    /** 全量状态快照（响应式）。 */
    state: () => DragState<P>;
    /** 被拖拽体（idle 为 null）。 */
    draggable: () => Draggable<P> | null;
    /** 按下。id/sourceIndex 描述被拖拽体。 */
    pointerDown: (id: string | number, sourceIndex: number, payload: P | undefined, pos: DragPoint) => boolean;
    /** 移动。返回 'activated' 表示本次移动恰好触发了提起（边沿事件）。 */
    pointerMove: (pos: DragPoint) => 'activated' | 'moved' | 'idle';
    /** 松手。进入 dropping；返回建议的动画时长（ms）。 */
    pointerUp: (pos: DragPoint) => number;
    /** Escape / pointercancel → cancelling。返回建议的飞回时长。 */
    cancel: (pos?: DragPoint) => number;
    /** 渲染层动画播完后调用；dropping/cancelling → idle。 */
    settle: () => void;
};
export declare const dragSplits: (keyof DragConfig)[];
export declare const createDrag: <P = unknown>(config: DragConfig<P>) => DragIns<P>;
