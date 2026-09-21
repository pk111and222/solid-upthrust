import { afterEach, expect, it } from 'vitest'
import Checkbox, { CheckboxGroup, type CheckboxProps, type CheckboxGroupProps, type CheckboxOption } from '../../../components/lib/Checkbox'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exports: [typeof Public.Checkbox, typeof Public.CheckboxGroup] = [Checkbox, CheckboxGroup]
const option: CheckboxOption = { label: '选项', value: 0 }
const props: [CheckboxProps, CheckboxGroupProps] = [{ defaultChecked: true }, { options: [option], defaultValue: [0] }]
let dispose = () => {}
afterEach(() => dispose())
// 公开命名导出和类型支持挂载及卸载，ref 返回原生输入。
it('[checkbox.exports.mount] named exports and cleanup', () => {
 let ref: HTMLInputElement | undefined
 const view = mount(() => <><Checkbox {...props[0]} ref={el => { ref = el }} /><CheckboxGroup {...props[1]} /></>); dispose = view.dispose
 expect(exports).toHaveLength(2); expect(view.host.querySelectorAll('input:checked')).toHaveLength(2); expect(ref).toBe(view.host.querySelector('input'))
 view.dispose(); dispose = () => {}; expect(view.host.isConnected).toBe(false)
})
