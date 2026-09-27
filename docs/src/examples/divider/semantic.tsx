import Divider from 'upthrust-ui/source/Divider'

export default function Semantic() {
  return <div data-divider-semantic>
    <Divider class="border-primary" data-semantic="root-color">根节点线色（rail 继承）</Divider>
    <Divider class="border-primary" style={{ 'border-top-width': '2px' }} data-semantic="root-width" />
    <Divider
      data-semantic="rail"
      classNames={{ rail: 'border-primary/60', content: 'text-primary' }}
      styles={{ rail: { 'border-top-width': '2px' }, content: { 'letter-spacing': '0.1em' } }}
    >
      rail / content 语义化
    </Divider>
    <Divider class="my-0" data-semantic="no-margin" />
    <p class="m-0 text-on-surface-variant">上面这条分割线用 class="my-0" 去掉了默认上下间距。</p>
  </div>
}
