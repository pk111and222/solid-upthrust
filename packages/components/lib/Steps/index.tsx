import { Component, JSX, For, Show, mergeProps, createMemo } from 'solid-js'
import { createSteps, type StepItem, type StepStatus } from 'upthrust-competence'
import { stepsContainerClass, stepItemClass, stepIconClass, stepConnectorClass, stepTitleClass, stepDescriptionClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface StepsProps {
  current?: number
  status?: StepStatus
  items: StepItem[]
  direction?: 'horizontal' | 'vertical'
  size?: 'default' | 'small'
  onChange?: (current: number) => void
  class?: string
  style?: JSX.CSSProperties
}

const Steps: Component<StepsProps> = (rawProps) => {
  const props = mergeProps(
    { direction: 'horizontal' as const, size: 'default' as const, current: 0 },
    rawProps
  )

  const steps = createSteps({
    get current() { return props.current },
    get items() { return props.items },
    get status() { return props.status },
    onChange: props.onChange
  })

  const getStatusIcon = (status: StepStatus, index: number) => {
    if (status === 'finish') return <span class="i-mdi-check text-base" />
    if (status === 'error') return <span class="i-mdi-close text-base" />
    return <span>{index + 1}</span>
  }

  return (
    <div class={twMerge(stepsContainerClass({ direction: props.direction }), props.class)} style={props.style}>
      <For each={props.items}>
        {(item, index) => {
          const status = createMemo(() => steps.getStepStatus(index()))
          return (
            <Show when={props.direction === 'horizontal'} fallback={
              <div class="flex">
                <div class="flex flex-col items-center">
                  <div
                    class={stepIconClass({ status: status(), size: props.size })}
                    onClick={() => props.onChange && steps.goTo(index())}
                    style={{ cursor: props.onChange ? 'pointer' : 'default' }}
                  >
                    {item.icon ? <span class={item.icon} /> : getStatusIcon(status(), index())}
                  </div>
                  <Show when={index() < props.items.length - 1}>
                    <div class={stepConnectorClass({ status: steps.getStepStatus(index()), direction: 'vertical' })} />
                  </Show>
                </div>
                <div class="ml-3 pb-6">
                  <div class={stepTitleClass({ status: status() })}>{item.title}</div>
                  <Show when={item.description}>
                    <div class={stepDescriptionClass({ status: status() })}>{item.description}</div>
                  </Show>
                </div>
              </div>
            }>
              <div class={stepItemClass({ direction: 'horizontal' })}>
                <div class="flex flex-col items-center">
                  <div
                    class={stepIconClass({ status: status(), size: props.size })}
                    onClick={() => props.onChange && steps.goTo(index())}
                    style={{ cursor: props.onChange ? 'pointer' : 'default' }}
                  >
                    {item.icon ? <span class={item.icon} /> : getStatusIcon(status(), index())}
                  </div>
                  <div class="mt-2 text-center">
                    <div class={stepTitleClass({ status: status() })}>{item.title}</div>
                    <Show when={item.description}>
                      <div class={stepDescriptionClass({ status: status() })}>{item.description}</div>
                    </Show>
                  </div>
                </div>
              </div>
              <Show when={index() < props.items.length - 1}>
                <div class={stepConnectorClass({ status: steps.getStepStatus(index()), direction: 'horizontal' })} />
              </Show>
            </Show>
          )
        }}
      </For>
    </div>
  )
}

export default Steps
