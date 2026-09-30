import { flush } from 'solid-js'
import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Modal from '../../../components/lib/Modal'
import Drawer from '../../../components/lib/Drawer'
import { mount } from '../../utils/mount'

const modalProps: Public.ModalProps = {
  open: true,
  title: 'modal',
  mask: { blur: true } satisfies Public.ModalMaskConfig,
  closable: { disabled: false } satisfies Public.ModalClosableConfig,
  focusable: { trap: true } satisfies Public.ModalFocusable,
  classNames: { container: 'c' } satisfies Public.ModalSemanticClassNames,
  styles: (info: Public.ModalSemanticInfo) => ({ body: { color: info.props.open ? 'red' : 'blue' } }) satisfies Public.ModalSemanticStyles,
  footer: (origin, extra: Public.ModalFooterExtra) => [origin, typeof extra.OkBtn],
}
const drawerProps: Public.DrawerProps = {
  open: true,
  title: 'drawer',
  placement: 'left' satisfies Public.DrawerPlacement,
  closable: { placement: 'end' } satisfies Public.DrawerClosableConfig,
  resizable: { onResize: () => {} } satisfies Public.DrawerResizableConfig,
  mask: { closable: false } satisfies Public.DrawerMaskConfig,
  focusable: { focusTriggerAfterClose: false } satisfies Public.DrawerFocusable,
  classNames: { section: 's' } satisfies Public.DrawerSemanticClassNames,
  styles: (info: Public.DrawerSemanticInfo) => ({ body: { color: info.props.open ? 'red' : 'blue' } }) satisfies Public.DrawerSemanticStyles,
}
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开组件签名与目录实现一致。
const PublicModal: typeof Public.Modal = Modal
const PublicDrawer: typeof Public.Drawer = Drawer
const staticConfig: Public.ModalStaticConfig = { content: 'x' }

// 公开入口：Modal / Drawer、静态方法与语义化类型可用；最小挂载后可清理。
it('[modal.exports] mounts Modal and Drawer from the public entry', async () => {
  expect(typeof Modal.confirm).toBe('function')
  expect(staticConfig.content).toBe('x')
  const view = mount(() => <><PublicModal {...modalProps}>m</PublicModal><PublicDrawer {...drawerProps}>d</PublicDrawer></>)
  await new Promise(resolve => setTimeout(resolve)); flush()
  try {
    expect([...document.querySelectorAll('[role="dialog"]')].map(el => el.textContent?.includes('modal') || el.textContent?.includes('drawer'))).toEqual([true, true])
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
