import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Form, { FormItem } from '../../../components/lib/Form'
import Transfer from '../../../components/lib/Transfer'
import type { FormInstance } from '../../../competence/src/form'
import { mount } from '../../utils/mount'

const data = [{ key: 0, title: '甲' }, { key: 1, title: '乙' }]
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// Form.Item 初值、移入写回、外部赋值与重置都应同步两侧列表。
it('[transfer.form.field] binds target keys to the Form store', () => {
  let form: FormInstance | undefined
  const onChange = vi.fn()
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ members: [0] }}>
    <FormItem name="members" label="成员"><Transfer dataSource={data} onChange={onChange} /></FormItem>
  </Form>); dispose = view.dispose
  const left = view.host.querySelector<HTMLElement>('section[aria-label="待选项"]')!
  const right = view.host.querySelector<HTMLElement>('section[aria-label="已选项"]')!
  expect(right.textContent).toContain('甲')
  left.querySelector<HTMLInputElement>('input[aria-label="乙"]')!.click(); flush()
  view.host.querySelector<HTMLButtonElement>('button[aria-label="移入右侧"]')!.click(); flush()
  expect(form?.getFieldValue('members')).toEqual([0, 1])
  expect(onChange).toHaveBeenLastCalledWith([0, 1], 'right', [1])
  expect(right.textContent).toContain('乙')
  form?.setFieldValue('members', []); flush()
  expect(right.textContent).not.toContain('乙')
  form?.resetFields(); flush()
  expect(right.textContent).toContain('甲')
  expect(right.textContent).not.toContain('乙')
})

// Form 的禁用及字段校验状态应传入控件，不可绕过禁用执行移动。
it('[transfer.form.injection] forwards disabled and warning status', () => {
  const view = mount(() => <Form disabled initialValues={{ members: [] }}>
    <FormItem name="members" validateStatus="warning"><Transfer dataSource={data} /></FormItem>
  </Form>); dispose = view.dispose
  const group = view.host.querySelector<HTMLElement>('[role="group"]')!
  expect(group.getAttribute('aria-disabled')).toBe('true')
  expect(group.querySelector('section')?.className).toContain('border-[#faad14]')
  expect(group.querySelector<HTMLInputElement>('input[aria-label="甲"]')?.disabled).toBe(true)
  expect(group.querySelector<HTMLButtonElement>('button[aria-label="移入右侧"]')?.disabled).toBe(true)
})
