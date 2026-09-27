import { expect, expectTypeOf, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Form, { FormItem, FormList, type FormItemProps } from '../../../components/lib/Form'
import { mount } from '../../utils/mount'

it('[form.exports.mount] public Form, FormItem and FormList mount together', () => {
  const view = mount(() => <Form><FormItem label="字段"><span>自定义内容</span></FormItem><FormList name="rows">{() => <span>列表</span>}</FormList></Form>)
  try {
    expectTypeOf<typeof Public.Form>().toEqualTypeOf<typeof Form>()
    expectTypeOf<Public.FormItemProps>().toEqualTypeOf<FormItemProps>()
    expect(view.host.querySelector('form')).not.toBeNull()
    expect(view.host.textContent).toContain('自定义内容')
  } finally {
    view.dispose()
  }
})
