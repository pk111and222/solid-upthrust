import { createMemo, createSignal } from "solid-js";
import { createDrag } from "./drag";

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
  items: () => T[]
  /** Unique key per item — used to keep the dragged item identity across renders. */
  rowKey?: (item: T, index: number) => string | number
  /** Fired on commit with the reordered array; the consumer writes it back. */
  onMove?: (items: T[], from: number, to: number) => void
  /** Lock drag along this axis for hit-testing hints (renderer concern mostly). */
  disabled?: () => boolean
  /** Pointer travel (px) before the drag activates — separates click from drag. Default 4. */
  activationThreshold?: number
}

export type ListDragIns<T = unknown> = {
  /** Index of the row currently being dragged (-1 when idle). */
  draggingIndex: () => number
  /** Key of the dragged item (rowKey form) — stable across reorders. */
  draggingKey: () => string | number | undefined
  /** Index the dragged item would land on if dropped now (-1 when idle). */
  overIndex: () => number
  /** True while a drag session is active (pointer is down and moved). */
  isDragging: () => number | false
  // ---- pointer protocol (renderer feeds these from pointer events) ----
  dragStart: (index: number) => boolean
  /** Report the row under the pointer; updates overIndex with direction bias. */
  dragOver: (index: number) => boolean
  dragEnd: () => boolean
  dragCancel: () => void
  // ---- threshold-aware pointer protocol ------------------------------------
  /** Arm a row on pointerdown; activates after activationThreshold px of travel. */
  pointerDown: (index: number, y: number) => 'armed' | 'none'
  /** Feed pointermove Y; 'active' once the threshold has been crossed. */
  pointerMove: (y: number) => 'active' | 'idle'
  /** Release: commits an active drag, disarms a mere press. Returns drop-animation duration (ms). */
  pointerUp: (y: number) => number
  /** Escape / pointercancel. Returns fly-back duration (ms). */
  pointerCancel: () => number
  /** 渲染层 drop 动画播完后调用；dropping/cancelling → idle。 */
  settle: () => void
  // ---- keyboard protocol (a11y) ----
  /** Space/Enter on a handle: arm (start) or commit a pending keyboard move. */
  keyboardToggle: (index: number) => 'armed' | 'moved' | 'none'
  /** Arrow keys while armed move the pending target; returns the new over index. */
  keyboardMove: (index: number, dir: -1 | 1) => number
  /** Commit the pending keyboard move. */
  keyboardCommit: () => boolean
  // ---- derived ----
  /** The reordered array the current session WOULD produce (peek). */
  previewItems: () => T[]
  /** Compute the moved array (pure). */
  move: (from: number, to: number) => T[]
  /** 指针会话相位（idle/arming/dragging/dropping/cancelling）。 */
  phase: () => 'idle' | 'arming' | 'dragging' | 'dropping' | 'cancelling'
  /** How far the pointer has moved since the drag started (px; 0 idle). */
  dragOffsetY: () => number
  /** drop/cancel 动画建议时长（ms；0 = 无动画）。 */
  dropDuration: () => number
}

export const listDragSplits: (keyof ListDragConfig)[] = ['rowKey', 'onMove']

export const createListDrag = <T = unknown>(config: ListDragConfig<T>): ListDragIns<T> => {
  // ownedWrite: the drag protocol fires from pointer/keyboard event handlers.
  const [_draggingIndex, _setDraggingIndex] = createSignal(-1, { ownedWrite: true })
  const [_overIndex, _setOverIndex] = createSignal(-1, { ownedWrite: true })
  const [_armedIndex, _setArmedIndex] = createSignal(-1, { ownedWrite: true })

  // The generic pointer primitive (createDrag) supplies the full rbd-style
  // state machine: arming → dragging → dropping → idle, with settle() for
  // the drop-animation handshake. This layer keeps only the LIST semantics
  // (overIndex / move / keyboard) and mirrors the pointer session into its
  // own signals so both stay in sync.
  const [_offsetY, _setOffsetY] = createSignal(0, { ownedWrite: true })
  const [_dropDuration, _setDropDuration] = createSignal(0, { ownedWrite: true })
  /** phase 的本地镜像：renderer 读它而不是直接 poke pointer 内部。 */
  const [_phase, _setPhase] = createSignal<'idle' | 'arming' | 'dragging' | 'dropping' | 'cancelling'>('idle', { ownedWrite: true })

  const pointer = createDrag<number>({
    activationThreshold: config.activationThreshold ?? 4,
    axis: 'y',
    disabled: () => config.disabled?.() ?? false,
    onPhaseChange: (_from, to, s) => {
      _setPhase(to)
      if (to === 'dragging') {
        // Threshold crossed: the row lifts.
        _setOffsetY(s.geometry.delta.y)
      }
    },
    onDragMove: (s) => {
      _setOffsetY(s.geometry.delta.y)
    },
  })

  // Solid 2 batches ownedWrite commits: reading the plain signal right after
  // a setter in the SAME batch returns the stale value (the exact trap
  // createCarousel documents). Control flow (dragOver reading the session
  // state after dragStart) must see PENDING values — a no-op functional
  // write refreshes the read without notifying anyone.
  const pendingDragging = (): number => {
    let v: number | undefined
    _setDraggingIndex((prev) => { v = prev; return prev })
    return v ?? -1
  }
  const pendingOver = (): number => {
    let v: number | undefined
    _setOverIndex((prev) => { v = prev; return prev })
    return v ?? -1
  }
  const pendingArmed = (): number => {
    let v: number | undefined
    _setArmedIndex((prev) => { v = prev; return prev })
    return v ?? -1
  }

  const draggingIndex = createMemo(() => _draggingIndex())
  const overIndex = createMemo(() => _overIndex())
  const isDragging = createMemo<number | false>(() => {
    const i = _draggingIndex()
    return i >= 0 ? i : false
  })

  const keyOf = (item: T, index: number): string | number | undefined => {
    const getter = config.rowKey
    if (!getter) return undefined
    return getter(item, index)
  }

  const draggingKey = createMemo<string | number | undefined>(() => {
    const i = _draggingIndex()
    if (i < 0) return undefined
    const item = config.items()[i]
    return item === undefined ? undefined : keyOf(item, i)
  })

  const disabled = () => config.disabled?.() ?? false

  /** Pure array move (also the commit primitive). */
  const move = (from: number, to: number): T[] => {
    const items = config.items()
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
      return items.slice()
    }
    const next = items.slice()
    const [removed] = next.splice(from, 1)
    next.splice(to, 0, removed)
    return next
  }

  /** The array as it WOULD look if dropped right now. */
  const previewItems = createMemo<T[]>(() => {
    const from = _draggingIndex()
    const to = _overIndex()
    if (from < 0 || to < 0 || from === to) return config.items()
    return move(from, to)
  })

  const dragStart = (index: number) => {
    if (disabled()) return false
    const items = config.items()
    if (index < 0 || index >= items.length) return false
    _setDraggingIndex(index)
    _setOverIndex(index)
    return true
  }

  /**
   * Pointer-protocol variant with rbd threshold semantics: arms on
   * pointerdown, activates (drags) only after the pointer travels
   * `activationThreshold` px, and on release enters a DROPPING phase whose
   * suggested duration the renderer feeds to its drop animation. The
   * renderer calls settle() when that animation finishes.
   */
  const pointerDown = (index: number, y: number) => {
    if (!dragStart(index)) return 'none' as const
    pointer.pointerDown(index, index, index, { x: 0, y })
    return 'armed' as const
  }

  const pointerMove = (y: number): 'active' | 'idle' => {
    const result = pointer.pointerMove({ x: 0, y })
    return result === 'idle' ? 'idle' as const : 'active' as const
  }

  /** 松手 → dropping 阶段。返回 drop 动画建议时长（ms）；渲染完调 settle()。 */
  const pointerUp = (y: number): number => {
    const duration = pointer.pointerUp({ x: 0, y })
    _setDropDuration(duration)
    if (duration > 0) {
      // 真拖拽：进入 dropping。被拖行的提起视觉必须保持到 settle——
      // draggingIndex 因此不在这里清（dragEnd 延迟到 settle），
      // onMove 提交也随动画一起收口（rbd 的语义：落位动画结束才算落定）。
      return duration
    }
    // 从未激活——release the armed row without moving.
    dragCancel()
    return 0
  }

  /** drop 动画播完由渲染层调用：提交 move 并清场。 */
  const settle = () => {
    // dropping：提交落点；cancelling：丢弃（不清 list 状态会让下一轮
    // pointerDown 复用残留的 draggingIndex）。
    if (pointer.phase() === 'dropping') {
      dragEnd()
    } else if (pointer.phase() === 'cancelling') {
      dragCancel()
    }
    pointer.settle()
    _setOffsetY(0)
    _setDropDuration(0)
  }

  /** Escape / pointercancel → cancelling（飞回动画；不提交 move）。 */
  const pointerCancel = (): number => {
    const duration = pointer.cancel()
    _setDropDuration(duration)
    return duration
  }

  const dragOver = (index: number) => {
    const from = pendingDragging()
    if (from < 0 || disabled()) return false
    const items = config.items()
    if (index < 0 || index >= items.length) return false
    if (index === pendingOver()) return false
    _setOverIndex(index)
    return true
  }

  const dragEnd = () => {
    const from = pendingDragging()
    const to = pendingOver()
    _setDraggingIndex(-1)
    _setOverIndex(-1)
    if (from < 0 || to < 0 || from === to) return false
    config.onMove?.(move(from, to), from, to)
    return true
  }

  const dragCancel = () => {
    _setDraggingIndex(-1)
    _setOverIndex(-1)
    _setArmedIndex(-1)
  }

  // ---- keyboard protocol --------------------------------------------------
  const keyboardToggle = (index: number): 'armed' | 'moved' | 'none' => {
    if (disabled()) return 'none'
    const armed = pendingArmed()
    if (armed === index) return keyboardCommit() ? 'moved' : 'none'
    const items = config.items()
    if (index < 0 || index >= items.length) return 'none'
    // Space on a different row: re-arm the session there (dnd-kit keeps one
    // session at a time).
    _setArmedIndex(index)
    _setDraggingIndex(index)
    _setOverIndex(index)
    return 'armed'
  }

  const keyboardMove = (index: number, dir: -1 | 1) => {
    if (disabled()) return -1
    const armed = pendingArmed()
    if (armed !== index) return -1
    // The over index tracks the PENDING target — arrows chain off the
    // CURRENT over (not the armed row), so consecutive presses accumulate
    // even within one batch.
    const current = pendingOver()
    const to = current >= 0 ? current + dir : index + dir
    const items = config.items()
    if (to < 0 || to >= items.length) return current
    // Live preview: the over index follows the arrow while armed.
    _setOverIndex(to)
    return to
  }

  const keyboardCommit = () => {
    const armed = pendingArmed()
    const to = pendingOver()
    _setArmedIndex(-1)
    _setDraggingIndex(-1)
    _setOverIndex(-1)
    if (armed < 0 || to < 0 || armed === to) return false
    config.onMove?.(move(armed, to), armed, to)
    return true
  }

  return {
    draggingIndex,
    draggingKey,
    overIndex,
    isDragging,
    dragStart,
    dragOver,
    dragEnd,
    dragCancel,
    // threshold-aware pointer protocol (preferred over dragStart/dragEnd
    // for pointer interactions — click vs drag disambiguation built in)
    pointerDown,
    pointerMove,
    pointerUp,
    /** 渲染层 drop 动画播完后调用；dropping/cancelling → idle。 */
    settle,
    /** Escape / pointercancel。返回飞回动画建议时长。 */
    pointerCancel,
    keyboardToggle,
    keyboardMove,
    keyboardCommit,
    previewItems,
    move,
    /** 指针会话的当前相位（idle/arming/dragging/dropping/cancelling）。 */
    phase: () => _phase(),
    /** 被拖拽行相对拖起点的 Y 位移（px；dropping 后保持到 settle）。 */
    dragOffsetY: () => _offsetY(),
    /** drop/cancel 动画建议时长（ms；0 = 无动画）。 */
    dropDuration: () => _dropDuration(),
  }
}
