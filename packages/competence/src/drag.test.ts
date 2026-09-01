import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createDrag, type DragPhase } from './drag'

const P = (x: number, y: number) => ({ x, y })

describe('createDrag — 生命周期状态流', () => {
  it('完整相位流：idle → arming → dragging → dropping → idle', () => {
    createRoot((dispose) => {
      const phases: DragPhase[] = []
      const drag = createDrag({
        activationThreshold: 5,
        onPhaseChange: (from, to) => phases.push(to),
      })
      expect(drag.phase()).toBe('idle')
      drag.pointerDown('a', 0, undefined, P(100, 100))
      flush()
      expect(drag.phase()).toBe('arming')
      drag.pointerMove(P(120, 100)) // +20 > 5 阈值
      flush()
      expect(drag.phase()).toBe('dragging')
      expect(drag.isDragging()).toBe(true)
      const duration = drag.pointerUp(P(120, 100))
      flush()
      expect(drag.phase()).toBe('dropping')
      expect(duration).toBeGreaterThan(0)
      drag.settle()
      flush()
      expect(drag.phase()).toBe('idle')
      expect(phases).toEqual(['arming', 'dragging', 'dropping', 'idle'])
      dispose()
    })
  })

  it('取消流：dragging → cancelling → idle', () => {
    createRoot((dispose) => {
      const drag = createDrag({ activationThreshold: 5 })
      drag.pointerDown('a', 0, undefined, P(0, 0))
      drag.pointerMove(P(50, 0))
      const duration = drag.cancel(P(50, 0))
      flush()
      expect(drag.phase()).toBe('cancelling')
      expect(duration).toBeGreaterThan(0)
      drag.settle()
      flush()
      expect(drag.phase()).toBe('idle')
      dispose()
    })
  })

  it('阈值内释放回 idle 并报告点击', () => {
    createRoot((dispose) => {
      let clicked: any = null
      const drag = createDrag({
        activationThreshold: 5,
        onClick: (d) => { clicked = d },
      })
      drag.pointerDown('row-3', 3, { kind: 'item' }, P(0, 0))
      drag.pointerMove(P(2, 0))
      expect(drag.pointerUp(P(2, 0))).toBe(0)
      flush()
      expect(drag.phase()).toBe('idle')
      expect(clicked).not.toBeNull()
      expect(clicked.id).toBe('row-3')
      expect(clicked.payload).toEqual({ kind: 'item' })
      dispose()
    })
  })

  it('onPhaseChange 报告每次转移的 from→to', () => {
    createRoot((dispose) => {
      const transitions: string[] = []
      const drag = createDrag({
        activationThreshold: 5,
        onPhaseChange: (from, to) => transitions.push(`${from}->${to}`),
      })
      drag.pointerDown('a', 0, undefined, P(0, 0))
      drag.pointerMove(P(10, 0))
      drag.pointerUp(P(10, 0))
      drag.settle()
      flush()
      expect(transitions).toEqual([
        'idle->arming',
        'arming->dragging',
        'dragging->dropping',
        'dropping->idle',
      ])
      dispose()
    })
  })
})

describe('createDrag — 被拖拽体（draggable）', () => {
  it('draggable 贯穿整个会话且在 idle 时清空', () => {
    createRoot((dispose) => {
      const drag = createDrag({ activationThreshold: 5 })
      expect(drag.draggable()).toBeNull()
      drag.pointerDown('item-7', 7, { weight: 3 }, P(0, 0))
      flush()
      const d = drag.draggable()
      expect(d).toMatchObject({ id: 'item-7', sourceIndex: 7, payload: { weight: 3 } })
      drag.pointerMove(P(20, 0))
      drag.pointerUp(P(20, 0))
      drag.settle()
      flush()
      expect(drag.phase()).toBe('idle')
      expect(drag.draggable()).toBeNull()
      dispose()
    })
  })

  it('onDragStart 在提起一瞬携带完整快照', () => {
    createRoot((dispose) => {
      let started: any = null
      const drag = createDrag({
        activationThreshold: 5,
        onDragStart: (s) => { started = s },
      })
      drag.pointerDown('a', 2, 'data', P(10, 10))
      drag.pointerMove(P(10, 40))
      flush()
      expect(started).not.toBeNull()
      expect(started.phase).toBe('dragging')
      expect(started.draggable.id).toBe('a')
      expect(started.geometry.direction).toBe(1)
      dispose()
    })
  })
})

describe('createDrag — drop 动画时长', () => {
  it('时长随距离增长且有上下限', () => {
    createRoot((dispose) => {
      const drag = createDrag({
        activationThreshold: 5,
        dropDurationMin: 100,
        dropDurationMax: 300,
        dropDurationPerPx: 1,
      })
      // 短距离：贴下限
      drag.pointerDown('a', 0, undefined, P(0, 0))
      drag.pointerMove(P(10, 0))
      const short = drag.pointerUp(P(10, 0))
      drag.settle()
      // 10px * 1ms/px + 100 = 110
      expect(short).toBe(110)

      // 长距离：贴上限
      drag.pointerDown('a', 0, undefined, P(0, 0))
      drag.pointerMove(P(1000, 0))
      const long = drag.pointerUp(P(1000, 0))
      drag.settle()
      expect(long).toBe(300)
      dispose()
    })
  })

  it('release 快照携带落点与时长', () => {
    createRoot((dispose) => {
      const drag = createDrag({ activationThreshold: 5 })
      drag.pointerDown('a', 0, undefined, P(0, 0))
      drag.pointerMove(P(80, 0))
      const duration = drag.pointerUp(P(80, 0))
      flush()
      const st = drag.state()
      expect(st.release).not.toBeNull()
      expect(st.release!.duration).toBe(duration)
      expect(st.release!.at).toEqual(P(80, 0))
      dispose()
    })
  })
})

describe('createDrag — 几何与便捷判定', () => {
  it('delta 轴锁定与 nudge 计数', () => {
    createRoot((dispose) => {
      const drag = createDrag({ activationThreshold: 5, axis: 'y' })
      drag.pointerDown('a', 0, undefined, P(50, 50))
      drag.pointerMove(P(60, 100)) // activate
      drag.pointerMove(P(70, 150)) // move 1
      drag.pointerMove(P(80, 200)) // move 2
      flush()
      const st = drag.state()
      expect(st.geometry.delta).toEqual({ x: 0, y: 150 })
      expect(st.geometry.nudges).toBe(2)
      expect(drag.isPointerDown()).toBe(true)
      expect(drag.isActive()).toBe(true)
      dispose()
    })
  })

  it('disabled 拒绝 pointerDown', () => {
    createRoot((dispose) => {
      const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
      const drag = createDrag({ disabled: () => disabled() })
      expect(drag.pointerDown('a', 0, undefined, P(0, 0))).toBe(true)
      drag.pointerUp(P(0, 0))
      setDisabled(true)
      flush()
      expect(drag.pointerDown('a', 0, undefined, P(0, 0))).toBe(false)
      expect(drag.phase()).toBe('idle')
      dispose()
    })
  })

  it('非 idle 时 pointerDown 被拒绝（单会话）', () => {
    createRoot((dispose) => {
      const drag = createDrag({ activationThreshold: 5 })
      drag.pointerDown('a', 0, undefined, P(0, 0))
      drag.pointerMove(P(10, 0))
      expect(drag.pointerDown('b', 1, undefined, P(0, 0))).toBe(false)
      flush()
      expect(drag.draggable()!.id).toBe('a')
      dispose()
    })
  })
})
