import { flush } from 'solid-js'
import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Notification, { notification, NotificationProvider } from '../../../components/lib/Notification'
import { getNotificationManager } from '../../../competence/src/notification'
import { mount } from '../../utils/mount'

const args: Public.NotificationArgsProps = {
  title: 'x',
  type: 'success' satisfies Public.NotificationType,
  closable: { 'aria-label': 'close it' } satisfies Public.NotificationClosableConfig,
  classNames: { icon: 'i' } satisfies Public.NotificationSemanticClassNames,
  styles: (info: Public.NotificationSemanticInfo) => ({ title: { color: info.props.type === 'success' ? 'green' : 'red' } }) satisfies Public.NotificationSemanticStyles,
}
const legacy: Public.NotificationOpenProps = { message: 'legacy', btn: 'b' }
const options: Public.NotificationProviderProps = { top: 24, duration: 4.5, stack: { threshold: 3 }, placement: 'topRight' satisfies Public.NotificationPlacement }
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开签名与目录实现一致。
const PublicNotification: typeof Public.Notification = Notification
const PublicProvider: typeof Public.NotificationProvider = NotificationProvider
const api: Public.NotificationInstance = notification
const config: (o: Public.NotificationConfigOptions) => void = notification.config

// 公开入口：notification / Notification / NotificationProvider 与 ArgsProps / 语义化 / 结果句柄类型可用；挂载后可清理。
it('[notification.exports] opens a notification through the public entry', () => {
  const view = mount(() => <PublicProvider {...options} />)
  flush()
  try {
    config({ pauseOnHover: true })
    const result: Public.NotificationResult = api.open(args)
    api.open(legacy)
    flush()
    expect(PublicNotification).toBe(notification)
    expect(document.querySelector('[data-notification-part="icon"].i')).not.toBeNull()
    expect(document.querySelector('[data-notification-part="close"]')!.getAttribute('aria-label')).toBe('close it')
    expect(typeof result.update).toBe('function')
  } finally {
    const m = getNotificationManager()
    for (const item of m.allItems()) m.remove(item.key)
    view.dispose()
  }
  expect(view.host.isConnected).toBe(false)
})
