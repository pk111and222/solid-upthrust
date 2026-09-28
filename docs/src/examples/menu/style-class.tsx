import Menu, { type MenuClassNames, type MenuProps } from 'upthrust-ui/source/Menu'
import { collapseItems } from './data'

const classNames: MenuClassNames = { item: 'font-medium', subMenu: { item: 'italic' } }

export default function StyleClass() {
  // styles 可以是函数：参数 props 为合并默认值后的 Menu 属性。
  const styles: MenuProps['styles'] = info => ({
    root: { border: '1px solid #f0f0f0', padding: '8px', 'border-radius': '4px', 'background-color': info.props.theme === 'dark' ? undefined : '#fafafa' },
    item: { color: '#1677ff' },
    subMenu: { list: { color: '#fa541c' } },
  })
  return <Menu mode="inline" style={{ width: '256px' }} defaultOpenKeys={['sub1']} classNames={classNames} styles={styles} items={collapseItems} />
}
