import { expect, it } from 'vitest'
import Breadcrumb, { BreadcrumbItem, type BreadcrumbItemType, type BreadcrumbProps } from '../../../components/lib/Breadcrumb'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

const exported: typeof Public.Breadcrumb = Breadcrumb
const exportedItem: typeof Public.BreadcrumbItem = BreadcrumbItem
const item: Public.BreadcrumbItemType = { title: '首页', href: '#' } satisfies BreadcrumbItemType

// 公开出口：Breadcrumb、Breadcrumb.Item 与类型从包入口导出，公开类型可用于挂载，卸载后宿主移除。
it('[breadcrumb.exports] public types mount and clean up', () => {
  const props: BreadcrumbProps = { items: [item, { title: '当前' }] }
  const view = mount(() => <Breadcrumb {...props} />)
  try {
    expect(exported).toBe(Breadcrumb)
    expect(exportedItem).toBe(BreadcrumbItem)
    expect(Breadcrumb.Item).toBe(BreadcrumbItem)
    expect(view.host.querySelector('nav > ol > li a')?.getAttribute('href')).toBe('#')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
