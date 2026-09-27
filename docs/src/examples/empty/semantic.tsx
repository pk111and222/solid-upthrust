import Button from 'upthrust-ui/source/Button'
import Empty, { type EmptySemanticStyles } from 'upthrust-ui/source/Empty'

// antd 的 styles 还支持函数形式（按 props 计算），这里按 description 预先算好对象。
const stylesObject: EmptySemanticStyles = {
  root: { 'background-color': '#f5f5f5', 'border-radius': '8px' },
  image: { filter: 'grayscale(100%)' },
  description: { color: '#1890ff', 'font-weight': 'bold' },
  footer: { 'margin-top': '16px' },
}
const stylesByDescription = (description: unknown): EmptySemanticStyles => description
  ? {
      root: { 'background-color': '#e6f7ff', border: '1px solid #91d5ff' },
      description: { color: '#1890ff', 'font-weight': 'bold' },
      image: { filter: 'hue-rotate(180deg)' },
    }
  : {}

export default function Semantic() {
  const classNames = { root: 'border border-dashed border-[#ccc] p-md' }
  return <div class="flex flex-col gap-4">
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="对象形式的样式" classNames={classNames} styles={stylesObject}>
      <Button type="primary">立即创建</Button>
    </Empty>
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="按属性计算的样式" classNames={classNames} styles={stylesByDescription('按属性计算的样式')}>
      <Button type="primary">立即创建</Button>
    </Empty>
  </div>
}
