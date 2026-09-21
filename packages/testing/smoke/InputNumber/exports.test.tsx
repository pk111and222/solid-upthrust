import { afterEach, expect, it } from 'vitest'
import InputNumber, { type InputNumberProps, type InputNumberParser, type InputNumberFormatter } from '../../../components/lib/InputNumber'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exported: typeof Public.InputNumber = InputNumber
const parser: InputNumberParser = text => text
const formatter: InputNumberFormatter = value => String(value)
const props: InputNumberProps = { defaultValue: 0, parser, formatter }
let dispose = () => {}
afterEach(() => dispose())
// 公开组件和类型可以实际挂载，零值正常显示，ref 返回 input，卸载释放宿主。
it('[input-number.exports.mount] component types ref and cleanup', () => {
  let ref: HTMLInputElement | undefined
  const view = mount(() => <InputNumber {...props} ref={el => { ref = el }}/>)
  dispose = view.dispose
  expect(exported).toBe(InputNumber); expect(ref).toBe(view.host.querySelector('input')); expect(ref?.value).toBe('0')
  view.dispose(); dispose = () => {}; expect(view.host.isConnected).toBe(false)
})
