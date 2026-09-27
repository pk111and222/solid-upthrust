import { render } from '@solidjs/web'
import { afterEach, expect, it, vi } from 'vitest'
import { flush } from 'solid-js'
import { For } from '@solidjs/web'
import { createForm } from '../../../competence/src/form'
import type { FormInstance } from 'upthrust-competence'
import Form, { FormItem, FormList } from '../../../components/lib/Form'
import Input from '../../../components/lib/Input'
import Button from '../../../components/lib/Button'

let dispose: (() => void) | undefined
let host: HTMLDivElement | undefined

afterEach(() => {
  dispose?.()
  dispose = undefined
  host?.remove()
  host = undefined
  flush()
})

const mount = (view: Parameters<typeof render>[0]) => {
  host = document.createElement('div')
  document.body.append(host)
  dispose = render(view, host)
  flush()
  return host
}

it('[form.render.field] injects value, id, status and reset through Form.Item', async () => {
  const finish = vi.fn()
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ username: '初始值' }} onFinish={finish}>
    <FormItem name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
      <Input placeholder="用户名" />
    </FormItem>
    <button type="submit">提交</button>
  </Form>)

  const input = view.querySelector<HTMLInputElement>('input')!
  expect(input.value).toBe('初始值')
  expect(input.id).toMatch(/^upthrust-form-item-.+-username$/)
  input.value = ''
  input.dispatchEvent(new Event('input', { bubbles: true }))
  flush()
  await form?.submit().catch(() => undefined)
  expect(finish).not.toHaveBeenCalled()
  expect(view.textContent).toContain('请输入用户名')

  form?.setFieldValue('username', '已设置')
  flush()
  expect(input.value).toBe('已设置')
  form?.resetFields()
  flush()
  expect(input.value).toBe('初始值')
})

it('[form.render.custom] render props support custom controls', () => {
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }}>
    <FormItem name="code">
      {(_value, instance) => <button type="button" onClick={() => (instance as FormInstance).setFieldValue('code', 'from-render-props')}>自定义</button>}
    </FormItem>
  </Form>)

  view.querySelector<HTMLButtonElement>('button')!.click()
  flush()
  expect(form?.getFieldValue('code')).toBe('from-render-props')
})

it('[form.render.list] list rows write nested values and operations preserve submitted shape', async () => {
  const finish = vi.fn()
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} onFinish={finish}>
    <FormList name="users" initialValue={[{ name: '甲' }]}>
      {(fields, operations) => <>
        <For each={fields()}>
          {field => <FormItem name={[field.name, 'name']}>
            <Input placeholder={`用户-${field.name}`} />
          </FormItem>}
        </For>
        <button type="button" data-add onClick={() => operations.add({ name: '乙' })}>添加</button>
        <button type="submit">提交</button>
      </>}
    </FormList>
  </Form>)

  expect(view.querySelectorAll('input')).toHaveLength(1)
  view.querySelector<HTMLButtonElement>('[data-add]')!.click()
  flush()
  expect(view.querySelectorAll('input')).toHaveLength(2)
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ users: [{ name: '甲' }, { name: '乙' }] })
})

it('[form.render.list] surviving rows keep their DOM identity after removal', () => {
  let operations: { add: (value?: unknown) => void; remove: (index: number) => void } | undefined
  const view = mount(() => <Form initialValues={{ users: [{ name: '甲' }, { name: '乙' }] }}>
    <FormList name="users">
      {(fields, listOperations) => {
        operations = listOperations
        return <For each={fields()} keyed>{field => <FormItem name={[field.name, 'name']}><Input /></FormItem>}</For>
      }}
    </FormList>
  </Form>)
  const inputs = view.querySelectorAll('input')
  const first = inputs[0]
  const second = inputs[1]
  operations?.remove(0)
  flush()
  expect([...view.querySelectorAll('input')]).toContain(second)
  expect(second.value).toBe('乙')
  void first
})

it('[form.render.destroy] clearOnDestroy clears an externally owned form store', () => {
  const external = createForm({ initialValues: { value: 'kept' } })
  const view = mount(() => <Form form={external} clearOnDestroy>
    <FormItem name="value"><Input /></FormItem>
  </Form>)
  expect(external.getFieldValue('value')).toBe('kept')
  dispose?.()
  dispose = undefined
  flush()
  expect(external.values()).toEqual({})
  view.remove()
})

// 连续输入与异步校验不能重建普通子控件，也不能丢失焦点。
it('[form.render.focus] retains the input node across typing and validation', async () => {
  const view = mount(() => <Form><FormItem name="typing" rules={[{ required: true }]}><Input allowClear /></FormItem></Form>)
  const input = view.querySelector('input')!
  input.focus()
  for (const value of ['a', 'ab', 'abc']) {
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await Promise.resolve()
    flush()
    expect(view.querySelector('input')).toBe(input)
    expect(document.activeElement).toBe(input)
  }
})

// Solid 的无参数 JSX accessor 不是 Form.Item 的带参 render props。
it('[form.render.accessor] does not treat a JSX accessor as a field renderer', () => {
  const refs = vi.fn()
  const view = mount(() => <Form><FormItem name="accessor">{() => <Input ref={refs} />}</FormItem></Form>)
  const input = view.querySelector('input')!
  input.value = 'a'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  flush()
  expect(view.querySelector('input')).toBe(input)
  expect(refs).toHaveBeenCalledTimes(1)
})

// 同页多个表单使用同名字段时，label 必须只关联自己表单的控件。
it('[form.render.unique-id] isolates label associations across forms', () => {
  const view = mount(() => <><Form><FormItem name="name" label="甲"><Input /></FormItem></Form><Form><FormItem name="name" label="乙"><Input /></FormItem></Form></>)
  const inputs = [...view.querySelectorAll('input')]
  expect(inputs[0].id).not.toBe(inputs[1].id)
  expect([...view.querySelectorAll('label')].map(label => label.htmlFor)).toEqual(inputs.map(input => input.id))
})

// 反馈进入 Input 后缀区域且只渲染一次，清除按钮和计数仍然可用。
it('[form.render.feedback] renders one feedback slot beside clear and count', () => {
  const view = mount(() => <Form initialValues={{ value: 'abc' }}><FormItem name="value" hasFeedback validateStatus="error"><Input allowClear showCount /></FormItem></Form>)
  const input = view.querySelector('input')!
  expect(view.querySelectorAll('[data-form-feedback]')).toHaveLength(1)
  expect(input.parentElement?.querySelector('[data-form-feedback]')).not.toBeNull()
  view.querySelector<HTMLElement>('[aria-label="clear"]')!.click()
  flush()
  expect(input.value).toBe('')
  expect(view.querySelectorAll('[data-form-feedback]')).toHaveLength(1)
})

// 移动后行号需要响应更新，同时保留原有输入节点。
it('[form.render.list-labels] updates row labels after moving without remounting', () => {
  let move: (from: number, to: number) => void = () => {}
  const view = mount(() => <Form initialValues={{ rows: [{ value: '甲' }, { value: '乙' }] }}><FormList name="rows">{(fields, operations) => {
    move = operations.move
    return <For each={fields()} keyed>{field => <FormItem name={[field.name, 'value']} label={`第 ${field.name + 1} 行`}><Input /></FormItem>}</For>
  }}</FormList></Form>)
  const first = view.querySelector('input')!
  move(0, 1)
  flush()
  expect(view.querySelectorAll('input')[1]).toBe(first)
  expect([...view.querySelectorAll('label')].map(label => label.textContent)).toEqual(['第 1 行:', '第 2 行:'])
})

// component="div" 不得生成嵌套的原生 form。
it('[form.render.container] respects the div container for an independent inner store', () => {
  const view = mount(() => <Form><Form component="div"><FormItem name="inner"><Input /></FormItem></Form></Form>)
  expect(view.querySelectorAll('form')).toHaveLength(1)
})

// 一个重置按钮点击只广播一次 reset，避免清理/副作用重复执行。
it('[form.render.reset-once] resets each field once per reset-button click', async () => {
  const reset = vi.fn()
  const view = mount(() => <Form><FormItem name="value" onReset={reset}><Input /></FormItem><Button htmlType="reset">重置</Button></Form>)
  view.querySelector('button')!.click()
  flush()
  await Promise.resolve()
  flush()
  expect(reset).toHaveBeenCalledTimes(1)
})

// 传入外部实例时，Form 的初始值、提交回调仍须接线，不能仅配置未使用的内部实例。
it('[form.render.external-props] binds UI callbacks and initial values to an external instance', async () => {
  const finish = vi.fn()
  const originalFinish = vi.fn()
  const external = createForm({ callbacks: { onFinish: originalFinish } })
  const view = mount(() => <Form form={external} initialValues={{ value: '外部实例' }} onFinish={finish}><FormItem name="value"><Input /></FormItem></Form>)
  expect(view.querySelector('input')!.value).toBe('外部实例')
  await external.submit()
  expect(finish).toHaveBeenCalledWith({ value: '外部实例' })
  expect(originalFinish).not.toHaveBeenCalled()
})
