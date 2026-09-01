import { createMemo, createSignal, untrack } from "solid-js";

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

export type DragAxis = 'x' | 'y' | 'both'

/** 完整生命周期。 */
export type DragPhase = 'idle' | 'arming' | 'dragging' | 'dropping' | 'cancelling'

export type DragPoint = { x: number; y: number }

/** 被拖拽体：一次会话从一而终的身份描述。 */
export type Draggable<P = unknown> = {
  /** 渲染层自定义 id（如行 key）。 */
  id: string | number
  /** 拖起时的源位置索引。 */
  sourceIndex: number
  /** 渲染层自由附加的数据。 */
  payload?: P
}

/** 指针几何：一次会话内的全部坐标事实。 */
export type DragGeometry = {
  start: DragPoint
  current: DragPoint
  /** current − start，轴锁定后。 */
  delta: DragPoint
  /** 累计行程（px，双轴）。 */
  distance: number
  /** 激活瞬间的主轴方向；激活前为 null。 */
  direction: 1 | -1 | null
  /** overIndex 变更次数——rbd 的“nudge”概念，用于位移感知强度。 */
  nudges: number
}

/** 一次拖拽会话的全量快照。 */
export type DragState<P = unknown> = {
  phase: DragPhase
  draggable: Draggable<P> | null
  geometry: DragGeometry
  /** 松手时的落点几何（dropping/cancelling 阶段才有值）。 */
  release: {
    /** 松手瞬间指针位置。 */
    at: DragPoint
    /** drop 动画的建议时长（ms）——随距家距离动态，rbd 式加权。 */
    duration: number
  } | null
}

export type DragConfig<P = unknown> = {
  /** 指针需移动这么远（px）才算拖拽。默认 5（rbd 用 5px 阈值）。 */
  activationThreshold?: number
  /** 轴锁定。 */
  axis?: DragAxis
  /** 禁用整个交互。 */
  disabled?: () => boolean
  /** drop 动画时长基准：最小值。默认 150ms。 */
  dropDurationMin?: number
  /** drop 动画时长基准：最大值。默认 350ms（rbd 的动画随距离增长但有上限感）。 */
  dropDurationMax?: number
  /** 时长增长的距离系数：每 px 行程加这么久，clamp 到 [min, max]。 */
  dropDurationPerPx?: number
  // ---- 生命周期钩子（状态流观察点） ----
  /** 任意 phase 转移。旧→新，含会话状态。 */
  onPhaseChange?: (from: DragPhase, to: DragPhase, state: DragState<P>) => void
  /** 阈值越过、被拖拽体被提起的一瞬。 */
  onDragStart?: (state: DragState<P>) => void
  /** dragging 阶段每次指针移动。 */
  onDragMove?: (state: DragState<P>) => void
  /** 松手进入 dropping。 */
  onDrop?: (state: DragState<P>) => void
  /** 取消进入 cancelling。 */
  onDragCancel?: (state: DragState<P>) => void
  /** dropping/cancelling 动画收尾——渲染层动画播完后调用 settle() 触发。 */
  onSettle?: (state: DragState<P>) => void
  /** arming 释放（这其实是次点击）。 */
  onClick?: (draggable: Draggable<P>) => void
}

export type DragIns<P = unknown> = {
  /** 当前生命周期阶段（响应式）。 */
  phase: () => DragPhase
  /** 便捷判定。 */
  isArming: () => boolean
  isDragging: () => boolean
  isDropping: () => boolean
  isCancelling: () => boolean
  /** arming || dragging（指针还按着）。 */
  isPointerDown: () => boolean
  /** 一次会话从提起到落定是否完整发生过（用于“感知被拖拽”）。 */
  isActive: () => boolean
  /** 全量状态快照（响应式）。 */
  state: () => DragState<P>
  /** 被拖拽体（idle 为 null）。 */
  draggable: () => Draggable<P> | null
  // ---- 指针协议 ----
  /** 按下。id/sourceIndex 描述被拖拽体。 */
  pointerDown: (id: string | number, sourceIndex: number, payload: P | undefined, pos: DragPoint) => boolean
  /** 移动。返回 'activated' 表示本次移动恰好触发了提起（边沿事件）。 */
  pointerMove: (pos: DragPoint) => 'activated' | 'moved' | 'idle'
  /** 松手。进入 dropping；返回建议的动画时长（ms）。 */
  pointerUp: (pos: DragPoint) => number
  /** Escape / pointercancel → cancelling。返回建议的飞回时长。 */
  cancel: (pos?: DragPoint) => number
  /** 渲染层动画播完后调用；dropping/cancelling → idle。 */
  settle: () => void
}

export const dragSplits: (keyof DragConfig)[] = ['activationThreshold', 'axis', 'dropDurationMin', 'dropDurationMax', 'dropDurationPerPx']

const IDLE_GEOMETRY: DragGeometry = {
  start: { x: 0, y: 0 },
  current: { x: 0, y: 0 },
  delta: { x: 0, y: 0 },
  distance: 0,
  direction: null,
  nudges: 0,
}

/** 动画时长：随距“家”的行程动态加权，clamp 到 [min, max]（rbd 式）。 */
const dropDuration = (
  distance: number,
  cfg: { min: number; max: number; perPx: number },
): number => {
  const raw = cfg.min + distance * cfg.perPx
  return Math.min(cfg.max, Math.max(cfg.min, Math.round(raw)))
}

export const createDrag = <P = unknown>(config: DragConfig<P>): DragIns<P> => {
  const threshold = () => config.activationThreshold ?? 5
  const axis = () => config.axis ?? 'both'
  const durationCfg = () => ({
    min: config.dropDurationMin ?? 150,
    max: config.dropDurationMax ?? 350,
    perPx: config.dropDurationPerPx ?? 0.15,
  })

  // ownedWrite：全部协议入口都来自事件回调。
  const [_phase, _setPhase] = createSignal<DragPhase>('idle', { ownedWrite: true })
  const [_draggable, _setDraggable] = createSignal<Draggable<P> | null>(null, { ownedWrite: true })
  const [_start, _setStart] = createSignal<DragPoint>({ x: 0, y: 0 }, { ownedWrite: true })
  const [_current, _setCurrent] = createSignal<DragPoint>({ x: 0, y: 0 }, { ownedWrite: true })
  const [_direction, _setDirection] = createSignal<1 | -1 | null>(null, { ownedWrite: true })
  const [_nudges, _setNudges] = createSignal(0, { ownedWrite: true })
  const [_release, _setRelease] = createSignal<DragState<P>['release']>(null, { ownedWrite: true })

  const lockDelta = (raw: DragPoint): DragPoint => {
    switch (axis()) {
      case 'x': return { x: raw.x, y: 0 }
      case 'y': return { x: 0, y: raw.y }
      default: return raw
    }
  }

  /** 从 pending 值急取快照——钩子在 setter 同批次内触发，memo 读到的是旧值。
   * 全部读取包 untrack：这些是事件时序的命令式读取（非响应式求值），
   * 直接读会触发 STRICT_READ_UNTRACKED 警告刷屏。 */
  const pendingPhase = (): DragPhase => untrack(() => {
    let v: DragPhase | undefined
    _setPhase((p) => { v = p; return p })
    return v ?? 'idle'
  })
  const pendingGeometry = (): DragGeometry => untrack(() => {
    let start: DragPoint | undefined
    let current: DragPoint | undefined
    let direction: 1 | -1 | null | undefined
    let nudges: number | undefined
    _setStart((v) => { start = v; return v })
    _setCurrent((v) => { current = v; return v })
    _setDirection((v) => { direction = v; return v })
    _setNudges((v) => { nudges = v; return v })
    const s = start ?? { x: 0, y: 0 }
    const c = current ?? { x: 0, y: 0 }
    const raw = { x: c.x - s.x, y: c.y - s.y }
    return {
      start: s,
      current: c,
      delta: lockDelta(raw),
      distance: Math.hypot(raw.x, raw.y),
      direction: direction ?? null,
      nudges: nudges ?? 0,
    }
  })
  const pendingRelease = (): DragState<P>['release'] => untrack(() => {
    let v: DragState<P>['release'] | undefined
    _setRelease((r) => { v = r; return r })
    return v ?? null
  })

  const pendingDraggable = (): Draggable<P> | null => untrack(() => {
    let v: Draggable<P> | null | undefined
    _setDraggable((d) => { v = d; return d })
    return v ?? null
  })

  const snapshot = (): DragState<P> => ({
    phase: pendingPhase(),
    draggable: pendingDraggable(),
    geometry: pendingGeometry(),
    release: pendingRelease(),
  })

  /** 唯一的 phase 转移出口——所有钩子从这里统一发。 */
  const transition = (to: DragPhase, fire?: (s: DragState<P>) => void) => {
    const from = pendingPhase()
    _setPhase(to)
    if (to === 'idle') {
      // 会话终点统一清场：被拖拽体与几何归零（点击路径在清场前已捕获引用）。
      const s = { ...snapshot(), phase: to }
      _setDraggable(null)
      _setRelease(null)
      _setDirection(null)
      _setNudges(0)
      if (from !== to) config.onPhaseChange?.(from, to, s)
      fire?.(s)
      return
    }
    const s = { ...snapshot(), phase: to }
    if (from !== to) config.onPhaseChange?.(from, to, s)
    fire?.(s)
  }

  const state = createMemo<DragState<P>>(() => ({
    phase: _phase(),
    draggable: _draggable(),
    geometry: {
      start: _start(),
      current: _current(),
      delta: lockDelta({
        x: _current().x - _start().x,
        y: _current().y - _start().y,
      }),
      distance: Math.hypot(_current().x - _start().x, _current().y - _start().y),
      direction: _direction(),
      nudges: _nudges(),
    },
    release: _release(),
  }))

  const pointerDown = (
    id: string | number,
    sourceIndex: number,
    payload: P | undefined,
    pos: DragPoint,
  ) => {
    if (config.disabled?.()) return false
    if (pendingPhase() !== 'idle') return false
    _setDraggable({ id, sourceIndex, payload })
    _setStart({ ...pos })
    _setCurrent({ ...pos })
    _setDirection(null)
    _setNudges(0)
    _setRelease(null)
    transition('arming')
    return true
  }

  const pointerMove = (pos: DragPoint): 'activated' | 'moved' | 'idle' => {
    const phase = pendingPhase()
    if (phase !== 'arming' && phase !== 'dragging') return 'idle'
    _setCurrent({ ...pos })
    if (phase === 'arming') {
      const start = _start()
      const dist = Math.hypot(pos.x - start.x, pos.y - start.y)
      if (dist < threshold()) return 'idle'
      const dx = pos.x - start.x
      const dy = pos.y - start.y
      _setDirection(Math.abs(dy) >= Math.abs(dx) ? (dy >= 0 ? 1 : -1) : (dx >= 0 ? 1 : -1))
      transition('dragging', (s) => config.onDragStart?.(s))
      return 'activated'
    }
    _setNudges((n) => n + 1)
    config.onDragMove?.(snapshot())
    return 'moved'
  }

  const pointerUp = (pos: DragPoint): number => {
    const phase = pendingPhase()
    if (phase === 'arming') {
      // 从未激活——这是一次点击。清场前先取走引用（transition 会清空）。
      const clicked = pendingDraggable()
      transition('idle')
      if (clicked) config.onClick?.(clicked)
      return 0
    }
    if (phase !== 'dragging') return 0
    _setCurrent({ ...pos })
    const distance = pendingGeometry().distance
    const duration = dropDuration(distance, durationCfg())
    _setRelease({ at: { ...pos }, duration })
    transition('dropping', (s) => config.onDrop?.(s))
    return duration
  }

  const cancel = (pos?: DragPoint): number => {
    const phase = pendingPhase()
    if (phase === 'dragging') {
      if (pos) _setCurrent({ ...pos })
      const distance = pendingGeometry().distance
      const duration = dropDuration(distance, durationCfg())
      _setRelease(pos ? { at: { ...pos }, duration } : { at: { ..._current() }, duration })
      transition('cancelling', (s) => config.onDragCancel?.(s))
      return duration
    }
    if (phase === 'arming' || phase === 'dropping' || phase === 'cancelling') {
      transition('idle')
    }
    return 0
  }

  const settle = () => {
    const phase = pendingPhase()
    if (phase !== 'dropping' && phase !== 'cancelling') return
    transition('idle', (s) => config.onSettle?.(s))
  }

  return {
    phase: () => _phase(),
    isArming: () => _phase() === 'arming',
    isDragging: () => _phase() === 'dragging',
    isDropping: () => _phase() === 'dropping',
    isCancelling: () => _phase() === 'cancelling',
    isPointerDown: () => {
      const p = _phase()
      return p === 'arming' || p === 'dragging'
    },
    isActive: () => {
      const p = _phase()
      return p === 'dragging' || p === 'dropping' || p === 'cancelling'
    },
    state,
    draggable: () => _draggable(),
    pointerDown,
    pointerMove,
    pointerUp,
    cancel,
    settle,
  }
}
