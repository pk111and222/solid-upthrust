import { createSignal, Show, type Component } from 'solid-js'
import { render, type JSX } from '@solidjs/web'
import type { DialogIns } from 'upthrust-competence'
import type { ModalProps } from './index'
import Button from '../Button'

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
      {...config()}
      defaultOpen
      maskClosable={config().maskClosable ?? false}
      closable={config().closable ?? false}
      ref={value => { setDialog(value) }}
      afterClose={cleanup}
      onOk={() => invoke(config().onOk)}
      onCancel={() => invoke(config().onCancel)}
      footer={config().footer !== undefined ? config().footer : <div class="flex justify-end gap-2">
        <Show when={kind === 'confirm'}>
          <Button {...config().cancelButtonProps} onClick={() => dialog()?.requestClose('cancel')}>{config().cancelText ?? '取消'}</Button>
        </Show>
        <Button variant={config().okVariant ?? 'solid'} color="primary" {...config().okButtonProps}
          loading={dialog()?.busy() || config().confirmLoading} onClick={() => dialog()?.requestClose('ok')}>{config().okText ?? '确定'}</Button>
      </div>}
    >
      <div class="flex items-start gap-3">
        <Show when={config().icon !== null}>
          {config().icon ?? <span aria-hidden="true" class={`shrink-0 text-[24px] ${kind === 'error' ? 'i-mdi-close-circle text-error' : kind === 'success' ? 'i-mdi-check-circle text-green-600' : kind === 'info' ? 'i-mdi-information text-primary' : 'i-mdi-alert-circle text-amber-500'}`} />}
        </Show>
        <div class="min-w-0 flex-1">{config().content}</div>
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
