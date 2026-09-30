import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Spin from '../../../components/lib/Spin'
import { mount } from '../../utils/mount'

const props: Public.SpinProps = {
  description: 'x',
  percent: 'auto',
  indicator: (() => <i />) satisfies Public.SpinIndicator,
  classNames: { section: 's' } satisfies Public.SpinSemanticClassNames,
  styles: (info: Public.SpinSemanticInfo) => ({ indicator: { color: info.props.spinning ? 'red' : 'blue' } }) satisfies Public.SpinSemanticStyles,
}
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开组件签名与目录实现一致。
const PublicSpin: typeof Public.Spin = Spin

// 公开入口：Spin 与静态 setDefaultIndicator、语义化类型可用；最小挂载后可清理。
it('[spin.exports] mounts Spin from the public entry', () => {
  expect(typeof PublicSpin.setDefaultIndicator).toBe('function')
  const view = mount(() => <PublicSpin {...props} />)
  try {
    expect(view.host.querySelector('[aria-busy="true"]')).not.toBeNull()
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
