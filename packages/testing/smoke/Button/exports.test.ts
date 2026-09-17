import { expectTypeOf, it } from 'vitest'
import type { Button, ButtonProps, ButtonIns, ButtonType, ButtonShape, ButtonVariant, ButtonColor } from '../../../components/lib'
import type ButtonComponent from '../../../components/lib/Button'
// 公共入口必须导出组件、Props、实例与各属性联合类型。
it('[button.exports.types] exposes public type contracts', () => {
  expectTypeOf<typeof Button>().toEqualTypeOf<typeof ButtonComponent>()
  expectTypeOf<ButtonProps['type']>().toEqualTypeOf<ButtonType | undefined>()
  expectTypeOf<ButtonProps['shape']>().toEqualTypeOf<ButtonShape | undefined>()
  expectTypeOf<ButtonProps['variant']>().toEqualTypeOf<ButtonVariant | undefined>()
  expectTypeOf<ButtonProps['color']>().toEqualTypeOf<ButtonColor | undefined>()
  expectTypeOf<ButtonIns['buttonEle']>().returns.toEqualTypeOf<HTMLButtonElement | undefined>()
  expectTypeOf<ButtonProps['htmlType']>().toEqualTypeOf<'button'|'submit'|'reset'|undefined>()
})
