import { createRoot } from 'solid-js'
import { expect, expectTypeOf, it } from 'vitest'
import { createForm, type FormConfig, type FormWatchCallback } from '../../../competence/src/form'
import { createFormField, type FormFieldConfig, type FormFieldRule } from '../../../competence/src/formField'
import { createFormList, type FormListConfig } from '../../../competence/src/formList'
import type { InternalNamePath, NamePath } from '../../../competence/src/formUtils'

// 可省略配置仍接受 getter；只传字段或列表名称即可创建实例。
it('[form.types.defaults] 最小配置与默认值契约', () => {
  expectTypeOf<{}>().toExtend<FormConfig>()
  expectTypeOf<{name:string}>().toExtend<FormFieldConfig>()
  expectTypeOf<{name:string}>().toExtend<FormListConfig>()
  expectTypeOf<boolean>().not.toExtend<NamePath>()
  expectTypeOf<() => string>().not.toExtend<NamePath>()
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const form = createForm()
      const field = createFormField(form, {get name() {return 'title'}})
      const list = createFormList(form, {get name() {return 'rows'}})
      expect(field.value()).toBeUndefined()
      expect(list.fields()).toEqual([])
    })
  } finally { dispose() }
})
// watch 通知始终是“路径列表”；嵌套路径不能声明为单一路径。
it('[form.types.watch] 批量路径通知与字符串 setFields', () => {
  expectTypeOf<Parameters<FormWatchCallback>[2]>().toEqualTypeOf<InternalNamePath[]>()
  let dispose = () => {}
  const form = createRoot(cleanup => { dispose = cleanup; return createForm() })
  const paths: InternalNamePath[][] = []
  const unregister = form.registerWatch((_values,_all,namePaths) => paths.push(namePaths))
  try {
    form.setFields([{name:'title',value:'标题'}])
    expect(form.getFieldValue('title')).toBe('标题')
    expect(paths.at(-1)).toEqual([['title']])
    form.updateValue(['user','name'],'甲')
    expect(paths.at(-1)).toEqual([['user','name']])
    form.resetFields(['title',['user','name']])
    expect(paths.at(-1)).toEqual([['title'],['user','name']])
  } finally { unregister(); dispose() }
})
// 两参数 Promise 校验器与三参数 callback 校验器均为已有支持能力。
it('[form.types.validator] 两种校验器的声明', () => {
  const promiseRule: FormFieldRule = {validator: async (_rule, _value) => {}}
  const callbackRule: FormFieldRule = {validator: (_rule,_value,callback) => callback('错误')}
  expectTypeOf(promiseRule).toEqualTypeOf<FormFieldRule>()
  expectTypeOf(callbackRule).toEqualTypeOf<FormFieldRule>()
})
