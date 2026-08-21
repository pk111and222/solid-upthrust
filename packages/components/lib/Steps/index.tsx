import { Component, For, Show, merge, createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createSteps, type StepItem, type StepStatus } from 'upthrust-competence'
import {
  stepsContainerClass, stepItemClass, stepIconClass, stepGlyphClass,
  stepConnectorClass, stepTitleClass, stepTitleRowClass, stepSubTitleClass,
  stepDescriptionClass, stepDotClass,
} from './styles'
import { twMerge } from 'tailwind-merge'

export type { StepItem, StepStatus } from 'upthrust-competence'

export interface StepsProps {
  current?: number
  status?: StepStatus
  items: StepItem[]
  direction?: 'horizontal' | 'vertical'
  size?: 'default' | 'small'
  /** Dot-style progress indicator instead of numbered circles. */
  progressDot?: boolean
  /** 0-100 progress of the current step; drives the dot's fill hint. */
  percent?: number
  onChange?: (current: number) => void
  class?: string
  style?: JSX.CSSProperties
}

const Steps: Component<StepsProps> = (rawProps) => {
  const props = merge(
    { direction: 'horizontal' as const, size: 'default' as const, current: 0 },
    rawProps
  )

  const steps = createSteps({
    get current() { return props.current },
    get items() { return props.items },
    get status() { return props.status },
    get percent() { return props.percent },
    onChange: (c) => props.onChange?.(c),
  })

  const clickable = () => !!props.onChange

  // Glyph inside the circle: check / close icons live in cva (reliable
  // extraction); numbers render as plain text.
  const glyphFor = (status: StepStatus) => {
    if (status === 'finish') return 'check' as const
    if (status === 'error') return 'close' as const
    return 'number' as const
  }

  const StepNode: Component<{ item: StepItem; index: number; status: StepStatus }> = (p) => (
    <Show
      when={!props.progressDot}
      fallback={
        // Dot mode: the tiny dot rides in a control-height, vertically-centered
        // wrapper so its center matches the title/circle center line — the
        // connector's fixed mt then passes through it as well.
        <div class={stepTitleRowClass({ size: props.size })}>
          <button
            class={stepDotClass({ status: p.status, size: props.size })}
            style={{ cursor: clickable() ? 'pointer' : 'default' }}
            onClick={() => clickable() && steps.navigateTo(p.index)}
            aria-label={`Step ${p.index + 1}: ${p.item.title}`}
          />
        </div>
      }
    >
      <div
        class={stepIconClass({ status: p.status, size: props.size })}
        style={{ cursor: clickable() ? 'pointer' : 'default' }}
        onClick={() => clickable() && steps.navigateTo(p.index)}
        role="button"
        aria-current={p.status === 'process' ? 'step' : undefined}
      >
        <Show
          when={p.item.icon}
          fallback={
            <Show
              when={glyphFor(p.status) !== 'number'}
              fallback={<span>{p.index + 1}</span>}
            >
              <span class={stepGlyphClass({ glyph: glyphFor(p.status) })} />
            </Show>
          }
        >
          <span class={p.item.icon} />
        </Show>
      </div>
    </Show>
  )

  const connectorVariant = (status: StepStatus) => ({
    status,
    dirSize: `${props.direction}-${props.size}` as const,
  })

  const StepContent: Component<{ item: StepItem; index: number; status: StepStatus }> = (p) => (
    <div>
      <div class={stepTitleClass({ status: p.status })}>
        {p.item.title}
        <Show when={p.item.subTitle}>
          <span class={stepSubTitleClass({ status: p.status })}>{p.item.subTitle}</span>
        </Show>
      </div>
      <Show when={p.item.description}>
        <div class={stepDescriptionClass({ status: p.status })}>{p.item.description}</div>
      </Show>
    </div>
  )

  // Horizontal text block: the title row is exactly one CONTROL tall (32/24px)
  // and vertically centers its text — so the title always centers against the
  // circle no matter the text line-height, and the circle stays anchored at
  // the row top (keeping the connector's fixed mt on-center). Description
  // flows below without affecting either.
  const StepText: Component<{ item: StepItem; index: number; status: StepStatus }> = (p) => (
    <div class={stepTitleRowClass({ size: props.size })}>
      <div class={stepTitleClass({ status: p.status })}>
        {p.item.title}
        <Show when={p.item.subTitle}>
          <span class={stepSubTitleClass({ status: p.status })}>{p.item.subTitle}</span>
        </Show>
      </div>
    </div>
  )

  return (
    <div
      class={twMerge(stepsContainerClass({ direction: props.direction }), props.class)}
      style={props.style}
      data-percent={props.percent !== undefined ? steps.percentOf() : undefined}
    >
      <For each={props.items}>
        {(item, index) => {
          const status = createMemo(() => steps.getStepStatus(index()))
          return (
            <Show when={props.direction === 'horizontal'} fallback={
              // vertical: circle column (connector auto-centered under it) + text
              <div class="flex">
                <div class="flex flex-col items-center">
                  <StepNode item={item} index={index()} status={status()} />
                  <Show when={index() < props.items.length - 1}>
                    <div class={stepConnectorClass(connectorVariant(steps.getStepStatus(index())))} />
                  </Show>
                </div>
                <div class="ml-[12px] pb-[24px]">
                  <StepContent item={item} index={index()} status={status()} />
                </div>
              </div>
            }>
              {/* horizontal (standard layout): circle LEFT, title beside it, and the
                  connector INSIDE the step filling the remaining width after the
                  title — so the line runs from right after this step's text to
                  the next step's circle, at circle-center height. */}
              <div class={stepItemClass({ direction: 'horizontal' })}>
                <StepNode item={item} index={index()} status={status()} />
                <div class="ml-[8px] min-w-0 shrink">
                  <StepText item={item} index={index()} status={status()} />
                  <Show when={item.description}>
                    <div class={stepDescriptionClass({ status: status() })}>{item.description}</div>
                  </Show>
                </div>
                <Show when={index() < props.items.length - 1}>
                  <div class={stepConnectorClass(connectorVariant(steps.getStepStatus(index())))} />
                </Show>
              </div>
            </Show>
          )
        }}
      </For>
    </div>
  )
}

export default Steps
