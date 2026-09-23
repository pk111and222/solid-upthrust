import { createSignal, flush } from 'solid-js'
import { expect, it } from 'vitest'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Transfer, { type TransferItem, type TransferProps } from '../../../components/lib/Transfer'
import type * as Public from '../../../components/lib'
import type { TransferConfig, TransferDirection, TransferKey } from '../../../competence/src'
import { mount } from '../../utils/mount'

const exported: typeof Public.Transfer = Transfer
const items: TransferItem[] = [{ key: 0, title: '零' }]
const config: TransferConfig = { dataSource: items }
const key: TransferKey = 0
const direction: TransferDirection = 'right'
void config; void key; void direction

// 公开组件及类型可导入，Provider 禁用默认值应动态注入且显式属性优先。
it('[transfer.exports.provider] mounts public component with reactive defaults', () => {
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  const props: TransferProps = { dataSource: items }
  const view = mount(() => <ConfigProvider componentDisabled={disabled()}>
    <Transfer {...props} />
    <Transfer dataSource={items} disabled={false} />
  </ConfigProvider>)
  try {
    expect(exported).toBe(Transfer)
    const groups = view.host.querySelectorAll('[role="group"][aria-label="穿梭框"]')
    expect(groups).toHaveLength(2)
    expect(groups[0].getAttribute('aria-disabled')).toBe('true')
    expect(groups[1].getAttribute('aria-disabled')).toBe('false')
    setDisabled(false); flush()
    expect(groups[0].getAttribute('aria-disabled')).toBe('false')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
