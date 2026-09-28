import { createSignal } from 'solid-js'
import Breadcrumb from 'upthrust-ui/source/Breadcrumb'

export default function Overlay() {
  const [picked, setPicked] = createSignal('—')
  const [open, setOpen] = createSignal(false)
  return (
    <div class="flex flex-col gap-3">
      <Breadcrumb
        items={[
          { title: 'Upthrust' },
          { title: <a href="#overlay">组件</a> },
          {
            title: <a href="#overlay">通用</a>,
            // 悬浮打开；菜单项 title 是 label 的别名，path 渲染为 <a href={item.href + path}>。
            menu: {
              items: [
                { key: 'general', label: '通用' },
                { key: 'layout', title: '布局', path: '#overlay-layout' },
                { key: 'nav', label: '导航' },
              ],
              onClick: key => setPicked(key),
            },
          },
          {
            title: '按钮',
            // dropdownProps 透传给 Dropdown：这里改为点击触发。
            menu: { items: [{ key: 'primary', label: '主按钮' }, { key: 'text', label: '文本按钮' }], onClick: key => setPicked(key) },
            dropdownProps: { trigger: 'click', onOpenChange: setOpen },
          },
        ]}
      />
      <output class="text-[12px] text-on-surface/45">选中：{picked()}，点击菜单：{open() ? '打开' : '关闭'}</output>
    </div>
  )
}
