import Menu from 'upthrust-ui/source/Menu'

export default function RenderLabel() {
  // renderLabel 把标签渲染为原生链接：保留浏览器的新标签页打开、复制链接等行为。
  return <Menu mode="inline" style={{ width: '256px' }} selectedKeys={['button']} items={[
    { type: 'group', label: '通用', children: [{ key: 'button', label: 'Button 按钮' }, { key: 'icon', label: 'Icon 图标' }] },
    { type: 'group', label: '导航', children: [{ key: 'menu', label: 'Menu 导航菜单' }] },
  ]} renderLabel={item => item.type === 'group' ? <strong>{item.label}</strong> : <a href={`#${item.key}`}>{item.label}</a>} />
}
