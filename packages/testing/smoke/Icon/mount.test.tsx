import { expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import Icon from '../../../components/lib/Icon'
// 最小合法输入必须能够导入、挂载并正常销毁。
it('[Icon.smoke.mount] 最小挂载', () => {
  const view = mount(() => <Icon name="mdi:home" />)
  try { expect(view.host.querySelector('span')?.classList.contains('i-mdi-home')).toBe(true) } finally { view.dispose() }
})
