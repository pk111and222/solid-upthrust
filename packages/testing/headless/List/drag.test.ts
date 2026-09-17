import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createListDrag } from '../../../competence/src/listDrag'

// The drag protocol fires from event handlers — inside createRoot the plain
// signal writes (setDisabled) need ownedWrite, and the drag machine's own
// writes are already ownedWrite. Helper: an ownedWrite-enabled signal pair.
const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })

const letters = () => ['a', 'b', 'c', 'd', 'e']

const setup = (onMove?: (items: string[], from: number, to: number) => void) =>
  createListDrag<string>({
    items: () => letters(),
    rowKey: (item) => item,
    onMove,
  })

describe('createListDrag — pointer protocol', () => {
  it('dragStart marks a row and overIndex follows the pointer', () => {
    createRoot((dispose) => {
      const drag = setup()
      expect(drag.dragStart(1)).toBe(true)
      flush()
      expect(drag.isDragging()).toBe(1)
      expect(drag.draggingKey()).toBe('b')
      expect(drag.overIndex()).toBe(1)
      expect(drag.dragOver(3)).toBe(true)
      flush()
      expect(drag.overIndex()).toBe(3)
      dispose()
    })
  })

  it('dragEnd commits the move through onMove', () => {
    createRoot((dispose) => {
      // The onMove callback writes a signal — inside the owned root that
      // needs ownedWrite (Solid 2 REACTIVE_WRITE_IN_OWNED_SCOPE).
      const [moved, setMoved] = createSignal<string[] | null>(null, { ownedWrite: true })
      const drag = setup((items) => setMoved(items))
      drag.dragStart(1)
      drag.dragOver(3)
      expect(drag.dragEnd()).toBe(true)
      flush()
      // b moves from 1 to 3: a c d b e
      expect(moved()).toEqual(['a', 'c', 'd', 'b', 'e'])
      dispose()
    })
  })

  it('no-op drop (same index) does not fire onMove', () => {
    createRoot((dispose) => {
      let fired = 0
      const drag = setup(() => { fired++ })
      drag.dragStart(2)
      drag.dragOver(2)
      expect(drag.dragEnd()).toBe(false)
      flush()
      expect(fired).toBe(0)
      expect(drag.isDragging()).toBe(false)
      dispose()
    })
  })

  it('dragCancel resets without committing', () => {
    createRoot((dispose) => {
      let fired = 0
      const drag = setup(() => { fired++ })
      drag.dragStart(0)
      drag.dragOver(4)
      drag.dragCancel()
      expect(drag.dragEnd()).toBe(false)
      flush()
      expect(fired).toBe(0)
      expect(drag.draggingIndex()).toBe(-1)
      dispose()
    })
  })

  it('ignores out-of-range and disabled drags', () => {
    createRoot((dispose) => {
      // setDisabled(false) at module scope ran before this root — but the
      // PREVIOUS test's setDisabled(false) inside its own root already
      // committed; the module signal persists across tests. Reset defensively.
      setDisabled(false)
      const drag = createListDrag<string>({
        items: () => letters(),
        disabled: () => disabled(),
      })
      expect(drag.dragStart(99)).toBe(false)
      expect(drag.dragStart(-1)).toBe(false)
      // setDisabled(true) commits lazily (batched) — flush for visibility.
      setDisabled(true)
      flush()
      expect(drag.dragStart(0)).toBe(false)
      setDisabled(false)
      dispose()
    })
  })
})

describe('createListDrag — preview & move math', () => {
  it('previewItems shows the would-be order without committing', () => {
    createRoot((dispose) => {
      const drag = setup()
      drag.dragStart(0)
      drag.dragOver(4)
      flush()
      expect(drag.previewItems()).toEqual(['b', 'c', 'd', 'e', 'a'])
      // nothing committed: dragEnd on a fresh session would move
      dispose()
    })
  })

  it('move is pure (source array untouched)', () => {
    createRoot((dispose) => {
      const drag = setup()
      expect(drag.move(4, 0)).toEqual(['e', 'a', 'b', 'c', 'd'])
      expect(letters()).toEqual(['a', 'b', 'c', 'd', 'e'])
      expect(drag.move(1, 1)).toEqual(['a', 'b', 'c', 'd', 'e'])
      dispose()
    })
  })

  it('backward move keeps earlier items stable', () => {
    createRoot((dispose) => {
      const drag = setup()
      // d (3) back to 1: a d b c e
      expect(drag.move(3, 1)).toEqual(['a', 'd', 'b', 'c', 'e'])
      dispose()
    })
  })
})

describe('createListDrag — keyboard protocol', () => {
  it('arm → arrows move overIndex → commit fires onMove', () => {
    createRoot((dispose) => {
      const [moved, setMoved] = createSignal<string[] | null>(null, { ownedWrite: true })
      const drag = setup((items) => setMoved(items))
      expect(drag.keyboardToggle(0)).toBe('armed')
      expect(drag.keyboardMove(0, 1)).toBe(1)
      expect(drag.keyboardMove(0, 1)).toBe(2)
      // clamped at the end: 3, 4, then stays 4
      drag.keyboardMove(0, 1)
      drag.keyboardMove(0, 1)
      flush()
      expect(drag.overIndex()).toBe(4)
      expect(drag.keyboardToggle(0)).toBe('moved')
      flush()
      expect(moved()).toEqual(['b', 'c', 'd', 'e', 'a'])
      dispose()
    })
  })

  it('keyboardMove only works on the armed row', () => {
    createRoot((dispose) => {
      const drag = setup()
      expect(drag.keyboardMove(2, 1)).toBe(-1)
      drag.keyboardToggle(2)
      expect(drag.keyboardMove(1, 1)).toBe(-1)
      expect(drag.keyboardMove(2, -1)).toBe(1)
      dispose()
    })
  })

  it('left arrow clamps at index 0', () => {
    createRoot((dispose) => {
      const drag = setup()
      drag.keyboardToggle(1)
      expect(drag.keyboardMove(1, -1)).toBe(0)
      expect(drag.keyboardMove(1, -1)).toBe(0)
      dispose()
    })
  })

  it('re-arming on another row switches the session', () => {
    createRoot((dispose) => {
      const drag = setup()
      drag.keyboardToggle(0)
      expect(drag.keyboardToggle(3)).toBe('armed')
      flush()
      expect(drag.draggingIndex()).toBe(3)
      dispose()
    })
  })
})
