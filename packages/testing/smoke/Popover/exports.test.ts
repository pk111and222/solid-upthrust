import { expectTypeOf, it } from 'vitest'
import type { Popover, PopoverProps, PopoverPlacement, PopoverTrigger } from '../../../components/lib'
import type PopoverComponent from '../../../components/lib/Popover'

// 公共 barrel 应导出组件本身与 placement/trigger 联合类型。
it('[popover.exports.types] exposes the public component and placement/trigger unions', () => {
  expectTypeOf<typeof Popover>().toEqualTypeOf<typeof PopoverComponent>()
  expectTypeOf<PopoverProps['placement']>().toEqualTypeOf<PopoverPlacement | undefined>()
  expectTypeOf<PopoverProps['trigger']>().toEqualTypeOf<PopoverTrigger | undefined>()
  expectTypeOf<PopoverProps['onOpenChange']>().toEqualTypeOf<((open: boolean) => void) | undefined>()
})
