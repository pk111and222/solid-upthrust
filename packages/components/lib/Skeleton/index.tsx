import { Component, For, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createSkeleton, type SkeletonIns } from 'upthrust-competence'
import { skeletonElementClass, skeletonRowClass, skeletonTitleClass, skeletonBlockClass, skeletonAvatarClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface SkeletonProps {
  loading?: boolean
  /** Show the wave animation. */
  active?: boolean
  /** Round line ends. */
  round?: boolean
  title?: boolean | { width?: number | string }
  paragraph?: boolean | { rows?: number; width?: number | string | Array<number | string> }
  avatar?: boolean | { size?: number | string; shape?: 'circle' | 'square' }
  /** Real content; shown when loading is false (antd parity). */
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: SkeletonIns) => void
}

const Skeleton: Component<SkeletonProps> = (rawProps) => {
  const props = merge({ active: false, round: false } as const, rawProps)

  const sk = createSkeleton({
    get loading() { return props.loading },
    get active() { return props.active },
    get round() { return props.round },
    get title() { return props.title },
    get paragraph() { return props.paragraph },
    get avatar() { return props.avatar },
  })

  const avatarConfig = createMemo(() => {
    const a = props.avatar
    if (!a) return undefined
    if (a === true) return { size: 32 as number, shape: 'circle' as const }
    const size = typeof a.size === 'number' ? a.size : 32
    return { size, shape: a.shape ?? 'circle' as const }
  })

  const elementStyle = (width?: number | string): JSX.CSSProperties => {
    if (width === undefined) return {}
    return typeof width === 'number' ? { width: `${width}px` } : { width }
  }

  props.ref?.(sk.refs)

  return (
    <Show when={sk.loading()} fallback={props.children}>
      <div class={twMerge(skeletonBlockClass({ hasAvatar: !!avatarConfig() }), props.class)} style={props.style}>
        <Show when={avatarConfig()}>
          {(av) => (
            <span
              // Avatar classes AFTER element classes in the merge so the
              // avatar's shape radius (rounded-full / rounded-sm) wins over
              // the element base's `rounded` — twMerge keeps the LAST of
              // conflicting groups.
              class={twMerge(skeletonElementClass({ active: props.active }), skeletonAvatarClass({ shape: av().shape }))}
              style={{
                width: `${av().size}px`,
                height: `${av().size}px`,
              }}
            />
          )}
        </Show>
        <div class="flex-1 min-w-0">
          {/* First paragraph row drops its top margin: with a title the gap
              comes from the title's mb-8px (antd rhythm: title→text 8px,
              text lines 16px); without a title the block simply starts
              flush at the top. */}
          <For each={sk.blocks()}>
            {(block, i) => {
              const isFirstParagraph = createMemo(() =>
                block.kind === 'paragraph' && sk.blocks()[i() - 1]?.kind !== 'paragraph')
              return (
                <Show
                  when={block.kind === 'title'}
                  fallback={
                    <div
                      class={twMerge(
                        skeletonRowClass({ first: isFirstParagraph() }),
                        skeletonElementClass({ active: props.active, round: props.round }),
                      )}
                      style={elementStyle(block.width)}
                    />
                  }
                >
                  <div
                    class={twMerge(
                      skeletonTitleClass({}),
                      skeletonElementClass({ active: props.active, round: props.round }),
                    )}
                    style={elementStyle(block.width)}
                  />
                </Show>
              )
            }}
          </For>
        </div>
      </div>
    </Show>
  )
}

export default Skeleton
