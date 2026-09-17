import { expectTypeOf, it } from 'vitest'
import type { Dropdown, DropdownProps, DropdownMenuProps, DropdownMenuItem, DropdownPlacement, DropdownTrigger } from '../../../components/lib'
import type DropdownComponent from '../../../components/lib/Dropdown'

// 公共 barrel 应导出组件、菜单配置和全部属性联合类型，而非只验证深层源码能导入。
it('[dropdown.exports.types] exposes the public component and menu contracts', () => {
  expectTypeOf<typeof Dropdown>().toEqualTypeOf<typeof DropdownComponent>()
  expectTypeOf<DropdownProps['menu']>().toEqualTypeOf<DropdownMenuProps>()
  expectTypeOf<DropdownMenuProps['items']>().toEqualTypeOf<DropdownMenuItem[]>()
  expectTypeOf<DropdownProps['placement']>().toEqualTypeOf<DropdownPlacement | undefined>()
  expectTypeOf<DropdownProps['trigger']>().toEqualTypeOf<DropdownTrigger | undefined>()
  expectTypeOf<DropdownProps['onOpenChange']>().toEqualTypeOf<((open: boolean) => void) | undefined>()
  expectTypeOf<DropdownMenuProps['onClick']>().toEqualTypeOf<((key: string) => void) | undefined>()
  expectTypeOf<DropdownMenuItem['onClick']>().toEqualTypeOf<(() => void) | undefined>()
})
