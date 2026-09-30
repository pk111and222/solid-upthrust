import FloatButton from 'upthrust-ui/source/FloatButton'

// tooltip 传节点即气泡内容；传对象即 Tooltip 属性（placement、trigger 等）。
export default function TooltipDemo() {
  return <div style={{ position: 'relative', height: '160px', transform: 'translateZ(0)' }}>
    <FloatButton tooltip={{ title: 'Since 5.25.0+', placement: 'left' }} style={{ right: '94px' }} />
    <FloatButton tooltip={<div>Documents</div>} />
  </div>
}
