import { flush } from 'solid-js'
import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Message, { message, MessageProvider } from '../../../components/lib/Message'
import { getMessageManager } from '../../../competence/src/message'
import { mount } from '../../utils/mount'

const args: Public.MessageArgsProps = {
  content: 'x',
  type: 'success' satisfies Public.MessageType,
  classNames: { icon: 'i' } satisfies Public.MessageSemanticClassNames,
  styles: (info: Public.MessageSemanticInfo) => ({ title: { color: info.props.type === 'success' ? 'green' : 'red' } }) satisfies Public.MessageSemanticStyles,
}
const options: Public.MessageConfigOptions = { top: 8, duration: 3, placement: 'top' satisfies Public.MessagePlacement }
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开签名与目录实现一致。
const PublicMessage: typeof Public.Message = Message
const PublicProvider: typeof Public.MessageProvider = MessageProvider
const api: Public.MessageInstance = message

// 公开入口：message / Message / MessageProvider 与 ArgsProps / 语义化 / thenable 结果类型可用；挂载后可清理。
it('[message.exports] opens a message through the public entry', () => {
  const view = mount(() => <PublicProvider {...options} />)
  flush()
  try {
    const result: Public.MessageResult = api.open(args)
    flush()
    expect(PublicMessage).toBe(message)
    expect(document.querySelector('[data-message-part="icon"].i')).not.toBeNull()
    expect(typeof result.then).toBe('function')
  } finally {
    const m = getMessageManager()
    for (const item of m.items()) m.remove(item.key)
    view.dispose()
  }
  expect(view.host.isConnected).toBe(false)
})
