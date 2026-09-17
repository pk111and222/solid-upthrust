import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, Show, createContext, createEffect, createMemo, merge, onCleanup } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createImage, createImageGroup, type ImageGroupIns } from 'upthrust-competence'
import {
  imagePreviewClass, imagePreviewImgClass, imagePreviewToolbarClass, imagePreviewOpClass,
  imagePreviewCloseClass, imagePreviewArrowClass, imagePreviewCountClass,
  IMAGE_ZOOM_IN_ICON, IMAGE_ZOOM_OUT_ICON, IMAGE_ROTATE_LEFT_ICON, IMAGE_ROTATE_RIGHT_ICON,
  IMAGE_CLOSE_ICON, IMAGE_CHEVRON_LEFT_ICON, IMAGE_CHEVRON_RIGHT_ICON,
} from './styles'
import { twMerge } from 'tailwind-merge'

export interface ImagePreviewGroupProps {
  /** Controlled group preview open state. */
  previewVisible?: boolean
  defaultPreviewVisible?: boolean
  onPreviewVisibleChange?: (open: boolean) => void
  /** Controlled current image index. */
  current?: number
  defaultCurrent?: number
  /** Switch callback (current, prev) — antd preview.onChange signature. */
  onChange?: (current: number, prev: number) => void
  /** Wrap around at the ends. Default true. */
  infinite?: boolean
  /** Custom count badge renderer; default shows `${current} / ${total}`. */
  countRender?: (current: number, total: number) => JSX.Element
  class?: string
  children?: JSX.Element
  ref?: (val: ImageGroupIns) => void
}

/**
 * Group preview context: member Images render their own thumbnail + hover
 * mask but hand the OPEN gesture to the group (openAt) and skip their own
 * fullscreen overlay — the group renders ONE shared overlay.
 */
export type ImageGroupContextValue = {
  group: ImageGroupIns
}

// Solid 2's useContext throws without a provider unless the context carries a
// default. A neutral sentinel keeps standalone Images working: `null` group
// means "not in a group", which is the normal standalone path.
export const ImageGroupContext = createContext<ImageGroupContextValue | null>(null)

const ImagePreviewGroup: Component<ImagePreviewGroupProps> = (rawProps) => {
  const props = merge({ infinite: true } as Partial<ImagePreviewGroupProps>, rawProps)

  const group = createImageGroup({
    get previewVisible() { return props.previewVisible },
    get defaultPreviewVisible() { return props.defaultPreviewVisible },
    get onPreviewVisibleChange() { return props.onPreviewVisibleChange },
    get current() { return props.current },
    get defaultCurrent() { return props.defaultCurrent },
    get onChange() { return props.onChange },
    get infinite() { return props.infinite },
  })

  props.ref?.(group)

  // Children render DIRECTLY (no <For> indirection): pre-built JSX elements
  // routed through For's mapArray lose the provider's owner context in
  // Solid 2 (the element captured its owner at construction — the page —
  // and For re-inserts it without re-rooting), so member Images would read a
  // null group context. Direct insertion keeps the provider's owner chain
  // intact, exactly like Splitter's Panel registration.

  // The overlay needs per-image load/error status + zoom/rotate transform —
  // the same createImage machine a standalone preview uses, driven by the
  // GROUP's current src (a switch re-arms the status machine via its src
  // watcher and resets nothing else; transform reset is explicit below).
  const overlayImage = createImage({
    get src() { return group.currentSrc() },
    get minScale() { return 1 },
    get maxScale() { return 32 },
  })

  // antd parity: switching images resets zoom/rotate. The reset rides the
  // src-change watcher's settle — any current flip while open (or opening on
  // a different index) starts the next image from identity. Effects live
  // renderer-side per the headless layer's no-effects convention.
  createEffect(
    () => ({ open: group.previewOpen(), idx: group.carousel.current() }),
    () => { overlayImage.resetTransform() },
  )

  // While the group preview is open: lock page scroll, ESC closes, ←/→
  // switch. One listener owns all three keys.
  createEffect(
    () => group.previewOpen(),
    (open) => {
      if (!open) return
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') group.setPreviewOpen(false)
        else if (e.key === 'ArrowLeft') group.carousel.prev()
        else if (e.key === 'ArrowRight') group.carousel.next()
      }
      document.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', onKey)
      }
    },
  )
  onCleanup(() => { document.body.style.overflow = '' })

  const previewTransformStyle = createMemo(() => {
    const t = overlayImage.transform()
    return { transform: `scale(${t.scale}) rotate(${t.rotate}deg)` }
  })

  const total = createMemo(() => group.sources().length)
  const countNode = createMemo<JSX.Element>(() =>
    props.countRender
      ? props.countRender(group.carousel.current() + 1, total())
      : <span>{group.carousel.current() + 1} / {total()}</span>)

  return (
    <ImageGroupContext value={{ group }}>
      <div class={twMerge('inline-flex', 'gap-[8px]', 'flex-wrap', props.class)}>
        {props.children}
      </div>

      {/* Shared fullscreen overlay: current image + toolbar + switch arrows +
          count + close. Scrim click closes; interactive zones stop it. */}
      <Portal>
        <Show when={group.previewOpen()}>
          <div
            class={imagePreviewClass({ visible: group.previewOpen() })}
            onClick={() => group.setPreviewOpen(false)}
          >
            <img
              class={imagePreviewImgClass({})}
              src={overlayImage.effectiveSrc()}
              alt=""
              style={previewTransformStyle()}
              draggable={false}
              onLoad={() => overlayImage.notifyLoaded()}
              onError={() => overlayImage.notifyError()}
              onClick={(e) => e.stopPropagation()}
            />
            <div class={imagePreviewCountClass({})} onClick={(e) => e.stopPropagation()}>
              {countNode()}
            </div>
            <div class={imagePreviewToolbarClass({})} onClick={(e) => e.stopPropagation()}>
              <button type="button" class={imagePreviewOpClass({})} aria-label="zoom in" onClick={() => overlayImage.zoomIn()}>
                <span class={IMAGE_ZOOM_IN_ICON} />
              </button>
              <button type="button" class={imagePreviewOpClass({})} aria-label="zoom out" onClick={() => overlayImage.zoomOut()}>
                <span class={IMAGE_ZOOM_OUT_ICON} />
              </button>
              <button type="button" class={imagePreviewOpClass({})} aria-label="rotate left" onClick={() => overlayImage.rotateLeft()}>
                <span class={IMAGE_ROTATE_LEFT_ICON} />
              </button>
              <button type="button" class={imagePreviewOpClass({})} aria-label="rotate right" onClick={() => overlayImage.rotateRight()}>
                <span class={IMAGE_ROTATE_RIGHT_ICON} />
              </button>
            </div>
            <Show when={total() > 1}>
              <button
                type="button"
                class={imagePreviewArrowClass({ side: 'left', disabled: !group.carousel.canPrev() })}
                aria-label="previous image"
                onClick={(e) => { e.stopPropagation(); group.carousel.prev() }}
              >
                <span class={IMAGE_CHEVRON_LEFT_ICON} />
              </button>
              <button
                type="button"
                class={imagePreviewArrowClass({ side: 'right', disabled: !group.carousel.canNext() })}
                aria-label="next image"
                onClick={(e) => { e.stopPropagation(); group.carousel.next() }}
              >
                <span class={IMAGE_CHEVRON_RIGHT_ICON} />
              </button>
            </Show>
            <button
              type="button"
              class={imagePreviewCloseClass({})}
              aria-label="close"
              onClick={(e) => { e.stopPropagation(); group.setPreviewOpen(false) }}
            >
              <span class={IMAGE_CLOSE_ICON} />
            </button>
          </div>
        </Show>
      </Portal>
    </ImageGroupContext>
  )
}

export default ImagePreviewGroup
