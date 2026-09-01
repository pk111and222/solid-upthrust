import { Component, For, Show, createEffect, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createCarousel, type CarouselIns } from 'upthrust-competence'
import {
  carouselRootClass, carouselTrackClass, carouselSlideClass,
  carouselArrowClass, carouselDotsClass, carouselDotClass,
  CAROUSEL_PREV_ICON, CAROUSEL_NEXT_ICON, CAROUSEL_UP_ICON, CAROUSEL_DOWN_ICON,
} from './styles'
import { twMerge } from 'tailwind-merge'

export interface CarouselProps {
  /** Slide content; array order = slide order. */
  children?: JSX.Element
  /** Controlled current index. */
  current?: number
  defaultCurrent?: number
  /** Autoplay. Default false. */
  autoplay?: boolean
  /** ms between autoplay advances. Default 3000. */
  autoplaySpeed?: number
  /** Pause autoplay on hover (and focus). Default true. */
  pauseOnHover?: boolean
  /** Wrap around at the ends. Default true. */
  infinite?: boolean
  /**
   * Slide along the vertical axis: the track becomes a column, arrows move
   * to the top/bottom edges (chevrons up/down) and the dots sit on the right
   * edge as a column (react-slick vertical placement).
   */
  vertical?: boolean
  /** Show prev/next arrows. Default true. */
  arrows?: boolean
  /** Show the dot indicators. Default true. */
  dots?: boolean
  /**
   * Dots inside the slide area (bottom for horizontal, right for vertical)
   * or outside it (below / to the side). Default 'inner'.
   */
  dotPosition?: 'inner' | 'outer'
  /** Fixed slide height, px or CSS length. Default 160 (antd demo height). */
  height?: number | string
  beforeChange?: (from: number, to: number) => void
  afterChange?: (current: number) => void
  class?: string
  ref?: (val: CarouselIns) => void
}

const Carousel: Component<CarouselProps> = (rawProps) => {
  const props = merge(
    {
      autoplay: false,
      autoplaySpeed: 3000,
      pauseOnHover: true,
      infinite: true,
      vertical: false,
      arrows: true,
      dots: true,
      dotPosition: 'inner' as const,
      height: 160,
    } as Partial<CarouselProps>,
    rawProps,
  )

  // Slides come in as a single JSX children expression; Solid's
  // children() helper flattens fragments/arrays into a stable array.
  // For simplicity we require the consumer to pass an array (antd parity:
  // Carousel children are the slides). Resolve array children directly.
  const slides = createMemo<JSX.Element[]>(() => {
    const c = props.children
    if (c === undefined || c === null) return []
    return Array.isArray(c) ? c : [c]
  })

  // The headless machine is axis-agnostic (index/direction semantics are
  // identical); `vertical` only changes WHICH axis the renderer translates.
  const carousel = createCarousel({
    get current() { return props.current },
    get defaultCurrent() { return props.defaultCurrent },
    get count() { return slides().length },
    get infinite() { return props.infinite },
    get autoplay() { return props.autoplay },
    get autoplaySpeed() { return props.autoplaySpeed },
    get pauseOnHover() { return props.pauseOnHover },
    get beforeChange() { return props.beforeChange },
    get afterChange() { return props.afterChange },
  })

  props.ref?.(carousel)

  // ---- autoplay timer ------------------------------------------------------
  // The interval lives here (renderer side): the headless layer only exposes
  // the autoplayActive gate. Re-arms on speed change; cleared when the gate
  // closes (paused / single slide / disabled) or the component unmounts.
  createEffect(
    () => ({ active: carousel.autoplayActive(), speed: props.autoplaySpeed }),
    ({ active, speed }) => {
      if (!active) return
      const t = setInterval(() => carousel.next(), speed)
      return () => clearInterval(t)
    },
  )

  // ---- hover / focus pause -------------------------------------------------
  const pauseHandlers = {
    onMouseEnter: () => { if (props.pauseOnHover) carousel.pause() },
    onMouseLeave: () => { if (props.pauseOnHover) carousel.resume() },
    onFocusIn: () => { if (props.pauseOnHover) carousel.pause() },
    onFocusOut: () => { if (props.pauseOnHover) carousel.resume() },
  }

  const trackStyle = createMemo(() => {
    const offset = `-${carousel.current() * 100}%`
    return {
      transform: props.vertical ? `translateY(${offset})` : `translateX(${offset})`,
    }
  })

  const rootStyle = createMemo(() => ({
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  }))

  return (
    <div
      class={twMerge(carouselRootClass({}), props.class)}
      style={rootStyle()}
      {...pauseHandlers}
    >
      <div
        class={carouselTrackClass({ animate: carousel.animate(), vertical: props.vertical })}
        style={trackStyle()}
      >
        <For each={slides()}>
          {(slide) => <div class={carouselSlideClass({})}>{slide}</div>}
        </For>
      </div>

      {/* Arrow glyphs are CHILD spans: the arrow button carries bg-surface/60
          (a bg-* on the same element as an i-mdi-* mask icon overrides its
          currentColor fill and the chevron goes invisible). */}
      <Show when={props.arrows}>
        <Show
          when={!props.vertical}
          fallback={
            <>
              <button
                type="button"
                class={carouselArrowClass({ side: 'up', disabled: !carousel.canPrev() })}
                aria-label="previous"
                onClick={() => carousel.prev()}
              >
                <span class={CAROUSEL_UP_ICON} />
              </button>
              <button
                type="button"
                class={carouselArrowClass({ side: 'down', disabled: !carousel.canNext() })}
                aria-label="next"
                onClick={() => carousel.next()}
              >
                <span class={CAROUSEL_DOWN_ICON} />
              </button>
            </>
          }
        >
          <button
            type="button"
            class={carouselArrowClass({ side: 'left', disabled: !carousel.canPrev() })}
            aria-label="previous"
            onClick={() => carousel.prev()}
          >
            <span class={CAROUSEL_PREV_ICON} />
          </button>
          <button
            type="button"
            class={carouselArrowClass({ side: 'right', disabled: !carousel.canNext() })}
            aria-label="next"
            onClick={() => carousel.next()}
          >
            <span class={CAROUSEL_NEXT_ICON} />
          </button>
        </Show>
      </Show>

      <Show when={props.dots}>
        <div class={carouselDotsClass({ position: props.dotPosition, vertical: props.vertical })}>
          <For each={slides()}>
            {(_, i) => (
              <button
                type="button"
                class={carouselDotClass({ active: i() === carousel.current(), vertical: props.vertical })}
                aria-label={`slide ${i() + 1}`}
                onClick={() => carousel.goTo(i())}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default Carousel
