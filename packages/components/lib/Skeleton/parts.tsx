import type { Component } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { skeletonElementClass } from './styles'

export interface SkeletonElementProps {
  active?: boolean
  size?: 'small' | 'middle' | 'large' | number
  class?: string
  style?: JSX.CSSProperties
}
export interface SkeletonButtonProps extends SkeletonElementProps { block?: boolean; shape?: 'default' | 'round' | 'circle' }
export interface SkeletonAvatarProps extends SkeletonElementProps { shape?: 'circle' | 'square' }
export interface SkeletonInputProps extends SkeletonElementProps { block?: boolean }
export interface SkeletonNodeProps extends SkeletonElementProps { children?: JSX.Element }
const dimension = (size: SkeletonElementProps['size'], fallback = 32) =>
  typeof size === 'number' ? size : size === 'small' ? 24 : size === 'large' ? 40 : size === 'middle' ? 32 : fallback

export const SkeletonButton: Component<SkeletonButtonProps> = props => <span aria-hidden="true"
  class={twMerge(skeletonElementClass({ active: props.active }), 'inline-block shrink-0 align-middle', props.shape === 'circle' || props.shape === 'round' ? 'rounded-full' : 'rounded', props.class)}
  style={{ height: `${dimension(props.size)}px`, width: props.block ? '100%' : `${dimension(props.size) * (props.shape === 'circle' ? 1 : 2.5)}px`, ...props.style }} />
export const SkeletonAvatar: Component<SkeletonAvatarProps> = props => <span aria-hidden="true"
  class={twMerge(skeletonElementClass({ active: props.active }), 'inline-block shrink-0 align-middle', props.shape === 'square' ? 'rounded' : 'rounded-full', props.class)}
  style={{ width: `${dimension(props.size)}px`, height: `${dimension(props.size)}px`, ...props.style }} />
export const SkeletonInput: Component<SkeletonInputProps> = props => <span aria-hidden="true"
  class={twMerge(skeletonElementClass({ active: props.active }), 'inline-block align-middle', props.class)}
  style={{ width: props.block ? '100%' : '160px', height: `${dimension(props.size)}px`, ...props.style }} />
export const SkeletonNode: Component<SkeletonNodeProps> = props => <span aria-hidden="true"
  class={twMerge(skeletonElementClass({ active: props.active }), 'inline-flex items-center justify-center align-middle text-on-surface/25', props.class)}
  style={{ width: `${dimension(props.size, 100)}px`, height: `${dimension(props.size, 100)}px`, ...props.style }}>{props.children}</span>
