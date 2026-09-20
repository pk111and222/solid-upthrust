import { createMemo, createRoot, flush } from 'solid-js'
import { expect, it } from 'vitest'
import { createForm } from '../../../competence/src/form'
import { createFormField } from '../../../competence/src/formField'
// 不调用命令式 getFieldValue 时，字段的响应式 value 也必须读到 Form 初始值。
it('[form.initial.reactive] initializes before reactive field reads', () => {
 let dispose=()=>{}
 try {
  createRoot(d=>{
   dispose=d
   const form=createForm({initialValues:{query:'initial'}})
   const field=createFormField(form,{name:'query'})
   const value=createMemo(()=>field.value())
   flush();expect(value()).toBe('initial')
  })
 } finally {dispose()}
})
