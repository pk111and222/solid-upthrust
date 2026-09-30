import { createSignal, Show, type Component } from 'solid-js'
import { render, type JSX } from '@solidjs/web'
import type { DialogIns } from 'upthrust-competence'
import type { ModalProps } from './index'
import Button from '../Button'
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled } from '../../common/antIcons'

export interface ModalStaticConfig extends Omit<ModalProps, 'open' | 'defaultOpen' | 'onOk' | 'onCancel' | 'children' | 'ref'> {
  content?: JSX.Element
  icon?: JSX.Element | null
  /** A callback accepting close controls dismissal itself; promises auto-close on success. */
  onOk?: (close: () => void) => void | boolean | Promise<unknown>
  onCancel?: (close: () => void) => void | boolean | Promise<unknown>
}
export interface ModalStaticResult {
  destroy: () => void
  update: (config: Partial<ModalStaticConfig> | ((previous: ModalStaticConfig) => Partial<ModalStaticConfig>)) => void
}
type Kind = 'confirm' | 'info' | 'success' | 'warning' | 'error'

// antd static icons: 22px filled glyphs in the semantic colors.
const ICONS: Record<Kind, { Icon: Component; color: string }> = {
  confirm: { Icon: ExclamationCircleFilled, color: 'text-[#faad14]' },
  warning: { Icon: ExclamationCircleFilled, color: 'text-[#faad14]' },
  info: { Icon: InfoCircleFilled, color: 'text-primary' },
  success: { Icon: CheckCircleFilled, color: 'text-[#52c41a]' },
  error: { Icon: CloseCircleFilled, color: 'text-error' },
}

/** DOM and roots are allocated only when an imperative method is called. */
export function createModalMethods(ModalView: Component<ModalProps>) {
  const instances = new Set<ModalStaticResult>()
  const open = (kind: Kind, initial: ModalStaticConfig): ModalStaticResult => {
    if (typeof document === 'undefined') return { destroy() {}, update() {} }
    const host = document.createElement('div')
    document.body.append(host)
    const [config, setConfig] = createSignal(initial, { ownedWrite: true })
    const [dialog, setDialog] = createSignal<DialogIns | undefined>(undefined, { ownedWrite: true })
    let closing = false
    let disposed = false
    let dispose: (() => void) | undefined
    const cleanup = () => {
      if (disposed) return
      disposed = true
      instances.delete(result)
      queueMicrotask(() => { dispose?.(); host.remove() })
      config().afterClose?.()
    }
    const destroy = () => {
      if (closing || disposed) return
      closing = true
      dialog()?.setOpen(false)
      if (!dialog()) cleanup()
    }
    const result: ModalStaticResult = {
      destroy,
      update(patch) {
        if (!closing && !disposed) setConfig(previous => ({ ...previous, ...(typeof patch === 'function' ? patch(previous) : patch) }))
      },
    }
    const invoke = (handler: ModalStaticConfig['onOk']) => {
      const returned = handler?.(destroy)
      if (returned && typeof returned === 'object' && 'then' in returned) return returned
      return returned === false || (!!handler?.length && returned === undefined) ? false : true
    }
    instances.add(result)
    dispose = render(() => <ModalView
      width={416}
      {...config()}
      title={undefined}
      defaultOpen
      maskClosable={config().maskClosable ?? false}
      closable={config().closable ?? false}
      ref={value => { setDialog(value) }}
      afterClose={cleanup}
      onOk={() => invoke(config().onOk)}
      onCancel={() => invoke(config().onCancel)}
      footer={config().footer !== undefined ? config().footer : <>
        <Show when={kind === 'confirm'}>
          <Button {...config().cancelButtonProps} onClick={() => dialog()?.requestClose('cancel')}>{config().cancelText ?? '取消'}</Button>
        </Show>
        <Button type={config().okType ?? 'primary'} {...config().okButtonProps}
          loading={dialog()?.busy() || config().confirmLoading} onClick={() => dialog()?.requestClose('ok')}>{config().okText ?? (kind === 'confirm' ? '确定' : '知道了')}</Button>
      </>}
    >
      <div class="flex items-start gap-sm" data-modal-part="confirm-body">
        <Show when={config().icon !== null}>
          <span aria-hidden="true" class={`flex shrink-0 text-[22px] leading-none ${ICONS[kind].color}`}>
            {config().icon ?? (() => { const { Icon } = ICONS[kind]; return <Icon /> })()}
          </span>
        </Show>
        <div class="min-w-0 flex-1">
          <Show when={config().title !== undefined && config().title !== null}>
            <div class="text-[16px] font-semibold leading-[1.5] text-on-surface">{config().title}</div>
          </Show>
          <div class={config().title !== undefined && config().title !== null ? 'mt-xs' : ''}>{config().content}</div>
        </div>
      </div>
    </ModalView>, host)
    return result
  }
  return {
    confirm: (config: ModalStaticConfig) => open('confirm', config),
    info: (config: ModalStaticConfig) => open('info', config),
    success: (config: ModalStaticConfig) => open('success', config),
    warning: (config: ModalStaticConfig) => open('warning', config),
    error: (config: ModalStaticConfig) => open('error', config),
    destroyAll: () => { for (const instance of instances) instance.destroy() },
  }
}
