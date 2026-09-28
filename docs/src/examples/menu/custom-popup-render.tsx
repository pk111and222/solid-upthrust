import Menu from 'upthrust-ui/source/Menu'

const features = [
  { key: 'getting-started', title: '快速上手', description: '安装、引入与第一个页面。' },
  { key: 'components', title: '组件总览', description: '所有物料的用法与 API。' },
  { key: 'theme', title: '主题定制', description: '通过 preset 调整颜色与尺寸。' },
  { key: 'headless', title: 'Headless', description: '只要行为，不要样式。' },
]

export default function CustomPopupRender() {
  return <Menu mode="horizontal" items={[
    { key: 'home', label: '首页' },
    { key: 'features', label: '特性', children: features.map(f => ({ key: f.key, label: f.title })),
      // 自定义弹层：保留默认列表之外的完整布局；点击卡片由调用方处理。
      popupRender: (_node, info) => <div class="grid grid-cols-2 gap-xs p-md min-w-[420px] rounded-lg bg-surface shadow" data-popup-keys={info.keys.join('/')}>
        {features.map(f => <div class="p-sm rounded hover:bg-on-surface/4 cursor-pointer">
          <div class="font-medium">{f.title}</div>
          <div class="text-on-surface-variant">{f.description}</div>
        </div>)}
      </div> },
    { key: 'docs', label: '文档', children: [{ key: 'api', label: 'API' }, { key: 'faq', label: '常见问题' }] },
  ]} />
}
