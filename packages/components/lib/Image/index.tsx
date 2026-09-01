import { Component, Show, createEffect, createMemo, merge, onCleanup, useContext } from 'solid-js'
import { Portal, type JSX } from '@solidjs/web'
import { createImage, type ImageIns } from 'upthrust-competence'
import {
  imageWrapperClass, imageImgClass, imagePlaceholderClass, imageErrorClass,
  imageMaskClass, imagePreviewClass, imagePreviewImgClass,
  imagePreviewToolbarClass, imagePreviewOpClass, imagePreviewCloseClass,
  IMAGE_ERROR_ICON, IMAGE_MASK_ICON, IMAGE_ZOOM_IN_ICON, IMAGE_ZOOM_OUT_ICON,
  IMAGE_ROTATE_LEFT_ICON, IMAGE_ROTATE_RIGHT_ICON, IMAGE_CLOSE_ICON,
} from './styles'
import { ImageGroupContext } from './PreviewGroup'
import { twMerge } from 'tailwind-merge'

export interface ImageProps {
  /** Image source URL. */
  src?: string
  /** Replacement src when the primary one fails to load. */
  fallback?: string
  /** Alt text. */
  alt?: string
  /** Box width, px or CSS length. */
  width?: number | string
  /** Box height, px or CSS length. */
  height?: number | string
  /** Enable the click-to-preview fullscreen overlay. Default true. */
  preview?: boolean
  /** Controlled preview open state. */
  previewVisible?: boolean
  defaultPreviewVisible?: boolean
  onPreviewVisibleChange?: (open: boolean) => void
  /** Custom loading placeholder node; default renders a spinner. */
  placeholder?: JSX.Element
  /** Custom error node; default renders a broken-image glyph. */
  errorRender?: JSX.Element
  /** Zoom bounds / steps for the preview toolbar. */
  minScale?: number
  maxScale?: number
  scaleStep?: number
  rotateStep?: number
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: ImageIns) => void
}

const Image: Component<ImageProps> = (rawProps) => {
  const props = merge(
    {
      preview: true,
      minScale: 1,
      maxScale: 32,
      scaleStep: 0.5,
      rotateStep: 90,
    } as Partial<ImageProps>,
    rawProps,
  )

  // Group membership: inside a PreviewGroup the open gesture routes to the
  // group (openAt) and the member skips its own overlay — the group renders
  // ONE shared overlay. Standalone (no provider): undefined, business as usual.
  // Solid 2's useContext throws without a provider, hence the context default.
  const groupCtx = useContext(ImageGroupContext)

  const hasCustomPlaceholder = createMemo(() => props.placeholder !== undefined)

  const image = createImage({
    get src() { return props.src },
    get fallback() { return props.fallback },
    get hasPlaceholder() { return hasCustomPlaceholder() },
    get previewVisible() { return props.previewVisible },
    get defaultPreviewVisible() { return props.defaultPreviewVisible },
    get onPreviewVisibleChange() { return props.onPreviewVisibleChange },
    get minScale() { return props.minScale },
    get maxScale() { return props.maxScale },
    get scaleStep() { return props.scaleStep },
    get rotateStep() { return props.rotateStep },
  })

  props.ref?.(image)

  // Group members self-register: the registry order (mount order) IS the
  // member's index for openAt. A src change re-registers so the group's
  // currentSrc stays live (prev unregister + register appends — index shift
  // is acceptable for the rare live-src-flip case).
  if (groupCtx) {
    let unregister = groupCtx.group.register(props.src)
    createEffect(
      () => props.src,
      (src) => {
        unregister()
        unregister = groupCtx.group.register(src)
      },
    )
    onCleanup(() => unregister())
  }

  // While the fullscreen preview is open: lock page scroll and close on Esc.
  // Skipped for group members — the group's overlay owns the keyboard and
  // the scroll lock (its own listener handles ESC + ←/→).
  createEffect(
    () => !groupCtx && image.previewOpen(),
    (open) => {
      if (open) {
        document.body.style.overflow = 'hidden'
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Escape') image.setPreviewOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => {
          document.body.style.overflow = ''
          document.removeEventListener('keydown', onKey)
        }
      }
    },
  )
  onCleanup(() => { if (!groupCtx) document.body.style.overflow = '' })

  const boxStyle = createMemo(() => ({
    width: props.width !== undefined ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : undefined,
    height: props.height !== undefined ? (typeof props.height === 'number' ? `${props.height}px` : props.height) : undefined,
  }))

  const previewTransformStyle = createMemo(() => {
    const t = image.transform()
    return {
      transform: `scale(${t.scale}) rotate(${t.rotate}deg)`,
    }
  })

  // Preview interactions are disabled once the image has HARD-errored (no
  // fallback rescued it): a broken image offers nothing to zoom.
  const previewable = createMemo(() => props.preview && !image.isError())

  return (
    <div
      class={twMerge(imageWrapperClass({}), 'group', props.class)}
      style={{ ...boxStyle(), ...props.style }}
    >
      <img
        class={imageImgClass({ interactive: previewable() })}
        src={image.effectiveSrc()}
        alt={props.alt ?? ''}
        draggable={false}
        onLoad={() => image.notifyLoaded()}
        onError={() => image.notifyError()}
      />
      {/* Loading placeholder (custom node or the default spinner). */}
      <Show when={image.isLoading()}>
        <div class={imagePlaceholderClass({})}>
          <Show when={hasCustomPlaceholder()} fallback={<span class="i-mdi-loading animate-spin-upthrust text-[22px] text-on-surface/30" />}>
            {props.placeholder}
          </Show>
        </div>
      </Show>
      {/* Error state (only when no fallback src rescued the request). */}
      <Show when={image.isError() && props.fallback === undefined}>
        <div class={imageErrorClass({})}>
          <Show when={props.errorRender} fallback={
            <>
              <span class={`${IMAGE_ERROR_ICON} text-[28px]`} />
              <span class="text-[12px]">图片加载失败</span>
            </>
          }>
            {props.errorRender}
          </Show>
        </div>
      </Show>
      {/* Hover preview mask. Group members hand the open gesture to the
          group (openAt with their registry index). */}
      <Show when={previewable()}>
        <div
          class={imageMaskClass({})}
          onClick={() => {
            if (groupCtx) {
              const idx = groupCtx.group.sources().indexOf(props.src ?? '')
              groupCtx.group.openAt(idx >= 0 ? idx : 0)
            } else {
              image.setPreviewOpen(true)
            }
          }}
        >
          <span class={IMAGE_MASK_ICON} />
          <span>预览</span>
        </div>
      </Show>

      {/* Fullscreen preview overlay. Standalone images only — inside a group
          the SHARED group overlay renders instead. Clicking the scrim closes;
          the image and toolbar stop propagation so their interactions don't
          leak. Toolbar glyphs are CHILD spans: a bg-* on the same element as
          the mask icon overrides its currentColor fill. */}
      <Portal>
        <Show when={!groupCtx && image.previewOpen()}>
          <div
            class={imagePreviewClass({ visible: image.previewOpen() })}
            onClick={() => image.setPreviewOpen(false)}
          >
            <img
              class={imagePreviewImgClass({})}
              src={image.effectiveSrc()}
              alt={props.alt ?? ''}
              style={previewTransformStyle()}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
            <div class={imagePreviewToolbarClass({})} onClick={(e) => e.stopPropagation()}>
              <button type="button" class={imagePreviewOpClass({})} aria-label="zoom in" onClick={() => image.zoomIn()}>
                <span class={IMAGE_ZOOM_IN_ICON} />
              </button>
              <button type="button" class={imagePreviewOpClass({})} aria-label="zoom out" onClick={() => image.zoomOut()}>
                <span class={IMAGE_ZOOM_OUT_ICON} />
              </button>
              <button type="button" class={imagePreviewOpClass({})} aria-label="rotate left" onClick={() => image.rotateLeft()}>
                <span class={IMAGE_ROTATE_LEFT_ICON} />
              </button>
              <button type="button" class={imagePreviewOpClass({})} aria-label="rotate right" onClick={() => image.rotateRight()}>
                <span class={IMAGE_ROTATE_RIGHT_ICON} />
              </button>
            </div>
            <button type="button" class={imagePreviewCloseClass({})} aria-label="close" onClick={(e) => { e.stopPropagation(); image.setPreviewOpen(false) }}>
              <span class={IMAGE_CLOSE_ICON} />
            </button>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default Image

// antd-style compound access: <Image.PreviewGroup>. The named export
// ImagePreviewGroup remains the tree-shakeable entry.
import ImagePreviewGroup from './PreviewGroup'
Object.assign(Image, { PreviewGroup: ImagePreviewGroup })
export type { ImagePreviewGroupProps } from './PreviewGroup'
