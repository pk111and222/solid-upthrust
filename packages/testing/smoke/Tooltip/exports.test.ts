import { expectTypeOf, it } from 'vitest'
import type { Tooltip, TooltipProps, TooltipIns, TooltipPlacement, TooltipTrigger } from '../../../components/lib'
import type TooltipComponent from '../../../components/lib/Tooltip'

// 公共 barrel 必须导出组件本身与 ref 实例类型，不能只让消费者从 upthrust-competence 深挖。
it('[tooltip.exports.types] exposes the public component, ref handle and placement/trigger unions', () => {
  expectTypeOf<typeof Tooltip>().toEqualTypeOf<typeof TooltipComponent>()
  expectTypeOf<TooltipProps['ref']>().toEqualTypeOf<((val: TooltipIns) => void) | undefined>()
  expectTypeOf<TooltipProps['placement']>().toEqualTypeOf<TooltipPlacement | undefined>()
  expectTypeOf<TooltipProps['trigger']>().toEqualTypeOf<TooltipTrigger | undefined>()
  expectTypeOf<TooltipProps['onOpenChange']>().toEqualTypeOf<((open: boolean) => void) | undefined>()
  expectTypeOf<TooltipIns['open']>().toEqualTypeOf<() => boolean>()
  expectTypeOf<TooltipIns['setOpen']>().toEqualTypeOf<(v: boolean) => void>()
})
