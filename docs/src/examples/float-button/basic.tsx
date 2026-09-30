import FloatButton from 'upthrust-ui/source/FloatButton'

// 演示框用 translateZ(0) 建立 containing block，fixed 的悬浮按钮锚在框内右下角（right 24 / bottom 48）。
export default function Basic() {
  return <div style={{ position: 'relative', height: '160px', transform: 'translateZ(0)' }}>
    <FloatButton onClick={() => console.log('onClick')} />
  </div>
}
