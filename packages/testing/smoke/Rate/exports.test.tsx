import { afterEach, expect, it } from 'vitest'
import Rate, { type RateProps } from '../../../components/lib/Rate'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

const exported: typeof Public.Rate = Rate
const props: RateProps = { defaultValue: 0, count: 3 }
let dispose = () => {}
afterEach(() => dispose())

// 公开 Rate 导出与类型可以实际挂载，ref 返回 ul，卸载后宿主被清理。
it('[rate.exports.mount] public export ref and cleanup', () => {
  let ref: HTMLUListElement | undefined
  const view = mount(() => <Rate {...props} ref={el => { ref = el }} />)
  dispose = view.dispose
  expect(exported).toBe(Rate)
  expect(ref).toBe(view.host.querySelector('ul'))
  expect(view.host.querySelectorAll('li')).toHaveLength(3)
  view.dispose()
  dispose = () => {}
  expect(view.host.isConnected).toBe(false)
})
