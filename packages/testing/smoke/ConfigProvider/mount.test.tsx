import { expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Input from '../../../components/lib/Input'
// 最小合法输入必须能够导入、挂载并正常销毁。
it('[ConfigProvider.smoke.mount] 最小挂载', () => {
  const view = mount(() => <ConfigProvider componentDisabled><Input /></ConfigProvider>)
  try { expect(view.host.querySelector('input')?.disabled).toBe(true) } finally { view.dispose() }
})
