import { expect, it } from 'vitest'
import Menu from '../../../components/lib/Menu'
import { mount } from '../../utils/mount'
// 自定义标签保留真实锚点和已选中语义；默认字符串标签仍可使用。
it('[menu.label.render] 自定义导航标签', () => {
  const view = mount(() => <Menu items={[{key:'icon',label:'图标'}]} selectedKeys={['icon']} renderLabel={item => <a href={`/components/${item.key}/`}>{item.label}</a>} />)
  try {
    expect(view.host.querySelector('a')?.getAttribute('href')).toBe('/components/icon/')
    expect(view.host.querySelector('a')?.textContent).toBe('图标')
    expect(view.host.querySelector('[role="menuitem"]')?.getAttribute('aria-selected')).toBe('true')
  } finally { view.dispose() }
})
