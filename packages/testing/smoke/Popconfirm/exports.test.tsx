import { flush } from 'solid-js'
import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Popconfirm from '../../../components/lib/Popconfirm'
import { mount } from '../../utils/mount'

const props: Omit<Public.PopconfirmProps, 'children'> = {
  title: () => 'x',
  defaultOpen: true,
  okType: 'danger' satisfies Public.PopconfirmOkType,
  placement: 'bottomLeft' satisfies Public.PopconfirmPlacement,
  trigger: 'hover' satisfies Public.PopconfirmTrigger,
  classNames: { icon: 'i' } satisfies Public.PopconfirmSemanticClassNames,
  styles: (info: Public.PopconfirmSemanticInfo) => ({ title: { color: info.props.open ? 'red' : 'blue' } }) satisfies Public.PopconfirmSemanticStyles,
}
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开组件签名与目录实现一致。
const PublicPopconfirm: typeof Public.Popconfirm = Popconfirm

// 公开入口：Popconfirm 与语义化 / okType / ref 类型可用；最小挂载后可清理。
it('[popconfirm.exports] mounts Popconfirm from the public entry', () => {
  let ins: Public.PopconfirmIns | undefined
  const view = mount(() => <PublicPopconfirm {...props} ref={v => { ins = v }}><button>t</button></PublicPopconfirm>)
  flush()
  try {
    expect(ins?.open()).toBe(true)
    expect(document.querySelector('[data-popconfirm-part="icon"].i')).not.toBeNull()
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
