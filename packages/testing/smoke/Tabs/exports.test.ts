import { expectTypeOf, it } from 'vitest'
import type { Tabs, TabsProps, TabsItem, TabsIns } from '../../../components/lib'
import type TabsComponent from '../../../components/lib/Tabs'

// 公共 barrel 必须导出组件本身与 ref 实例类型，不能只让消费者从 upthrust-competence 深挖。
it('[tabs.exports.types] exposes the public component, item shape and ref handle', () => {
  expectTypeOf<typeof Tabs>().toEqualTypeOf<typeof TabsComponent>()
  expectTypeOf<TabsProps['ref']>().toEqualTypeOf<((val: TabsIns) => void) | undefined>()
  expectTypeOf<TabsProps['items']>().toEqualTypeOf<TabsItem[]>()
  expectTypeOf<TabsProps['onChange']>().toEqualTypeOf<((activeKey: string) => void) | undefined>()
  expectTypeOf<TabsIns['activeKey']>().toEqualTypeOf<() => string>()
  expectTypeOf<TabsIns['setActiveKey']>().toEqualTypeOf<(key: string) => void>()
  expectTypeOf<TabsIns['nextTab']>().toEqualTypeOf<() => void>()
  expectTypeOf<TabsIns['prevTab']>().toEqualTypeOf<() => void>()
})
