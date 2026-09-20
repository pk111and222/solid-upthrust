import { createSignal, flush } from 'solid-js'
import { expect, it } from 'vitest'
import Pagination, { type PaginationProps } from '../../../components/lib/Pagination'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exported: typeof Public.Pagination = Pagination
// 公开类型可挂载，组件级默认配置动态更新，显式属性优先且卸载清理宿主。
it('[pagination.exports.provider] mounts with reactive defaults', () => {
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  const props: PaginationProps = { total: 50, size: 'small' }
  const view = mount(() => <ConfigProvider components={{ Pagination: { disabled: disabled(), size: 'default' } }}><Pagination {...props} /></ConfigProvider>)
  try {
    expect(exported).toBe(Pagination)
    expect(view.host.querySelector('button')?.disabled).toBe(true)
    setDisabled(false); flush()
    expect(view.host.querySelector<HTMLButtonElement>('[aria-label="Next Page"]')?.disabled).toBe(false)
    expect(view.host.querySelector('button')?.className).toContain('h-[24px]')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
