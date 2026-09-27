import Tag, { CheckableTagGroup, type CheckableTagOption } from 'upthrust-ui/source/Tag'

const options: (string | CheckableTagOption<string>)[] = ['设计', '研发', { value: '产品', label: '产品', class: 'italic' }]

export default function Semantic() {
  return <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Tag icon={<span class="i-mdi-check-circle-outline" />}
        classNames={{ root: 'px-[6px] rounded-[4px]' }}
        styles={{ root: { 'background-color': '#e6f7ff' }, icon: { color: '#52c41a' }, content: { color: '#262626' } }}>对象形式</Tag>
      <Tag closable variant="outlined" color="purple" classNames={{ close: 'text-[#8f87f1]' }} styles={{ content: { 'font-weight': '600' } }} icon={<span class="i-mdi-tag-outline" />}>关闭按钮样式</Tag>
    </div>
    <CheckableTagGroup multiple defaultValue={['设计']} options={options}
      styles={{ root: { gap: '12px', padding: '8px 12px', 'background-color': 'rgba(82, 196, 26, 0.08)', 'border-radius': '8px' }, item: { 'border-color': 'rgba(82, 196, 26, 0.3)' } }} />
  </div>
}
