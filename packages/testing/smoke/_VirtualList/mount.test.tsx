import { expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import VirtualList from '../../../components/lib/_VirtualList'
// 最小合法输入必须能够导入、挂载并正常销毁。
it('[_VirtualList.smoke.mount] 最小挂载', () => {
  const view = mount(() => <VirtualList items={[1,2]}>{item => <span>{item}</span>}</VirtualList>)
  try { expect(view.host.querySelectorAll('span')).toHaveLength(2) } finally { view.dispose() }
})
