import { afterEach, expect, it } from 'vitest'
import Skeleton from '../../../components/lib/Skeleton'
import { mount } from '../../utils/mount'
let cleanup=()=>{}
afterEach(()=>cleanup())
// 已声明支持的 CSS 长度必须用于头像宽高，不能静默回退为 32px。
it('[skeleton.avatar.css-size] accepts CSS dimensions',()=>{
  const view=mount(()=><Skeleton avatar={{size:'3rem'}} />);cleanup=view.dispose
  const avatar=view.host.querySelector('span')!;expect(avatar.style.width).toBe('3rem');expect(avatar.style.height).toBe('3rem')
})
// Node 的默认尺寸为 100，但显式 middle 必须与其他子组件一致为 32。
it('[skeleton.node.middle] resolves explicit middle size',()=>{
  const view=mount(()=><Skeleton.Node size="middle" />);cleanup=view.dispose
  expect(view.host.querySelector('span')!.style.width).toBe('32px')
})
// 所有占位节点都应隐藏于可访问性树，避免伪装成真实内容。
it('[skeleton.a11y.decorative] hides placeholder tree',()=>{
  const view=mount(()=><Skeleton />);cleanup=view.dispose
  expect(view.host.firstElementChild!.getAttribute('aria-hidden')).toBe('true')
})
