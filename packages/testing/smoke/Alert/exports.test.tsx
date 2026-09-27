import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Alert, { type AlertProps } from '../../../components/lib/Alert'
import { mount } from '../../utils/mount'

const props: Public.AlertProps = {
  type: 'success' satisfies Public.AlertType,
  variant: 'filled' satisfies Public.AlertVariant,
  title: 'ok',
  closable: { closeIcon: true, 'aria-label': 'close' } satisfies Public.AlertClosable,
  classNames: { root: 'r' } satisfies Public.AlertSemanticClassNames,
  styles: info => ({ icon: { color: info.props.type === 'success' ? 'green' : 'red' } }) satisfies Public.AlertSemanticStyles,
} satisfies AlertProps
const PublicAlert: typeof Public.Alert = Alert
const boundary: Public.AlertErrorBoundaryProps = { title: 'x' }
// 公开入口：Alert、Alert.ErrorBoundary 与语义化类型可用；最小挂载后可清理。
it('[alert.exports] mounts Alert from the public entry', () => {
  expect(typeof PublicAlert.ErrorBoundary).toBe('function')
  expect(boundary.title).toBe('x')
  const view = mount(() => <PublicAlert {...props} />)
  try { expect(view.host.querySelector('[role="alert"]')?.textContent).toBe('ok') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
