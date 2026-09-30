import { createSignal } from 'solid-js'
import Button, { type ButtonIns } from 'upthrust-ui/source/Button'
import Tour, { type TourProps } from 'upthrust-ui/source/Tour'

// classNames / styles 支持对象与函数；函数的 info.props 为合并后的 Tour 属性。
const styles: TourProps['styles'] = ({ props }) => ({
  section: { 'background-color': props.type === 'primary' ? '#722ed1' : '#fffbe6', border: '1px solid #ffe58f' },
  title: { color: '#d46b08' },
  indicator: { 'border-radius': '2px' },
})

export default function StyleClass() {
  const [open, setOpen] = createSignal(false)
  let target: ButtonIns | undefined
  return <div>
    <Button type="primary" ref={b => { target = b }} onClick={() => setOpen(true)}>开始导览</Button>
    <Tour open={open()} onClose={() => setOpen(false)} styles={styles} classNames={{ description: 'text-on-surface-variant' }}
      steps={[{ title: '语义化样式', description: 'section / title / indicator 已被自定义。', target: () => target?.buttonEle() }, { title: '第二步', description: '步骤级 classNames / styles 也会合并。', styles: { title: { color: '#389e0d' } } }]} />
  </div>
}
