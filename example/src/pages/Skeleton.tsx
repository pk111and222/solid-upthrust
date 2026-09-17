import Basic from '../../../docs/src/examples/skeleton/basic'
import Composition from '../../../docs/src/examples/skeleton/composition'
import Width from '../../../docs/src/examples/skeleton/width'
import Avatar from '../../../docs/src/examples/skeleton/avatar'
import Active from '../../../docs/src/examples/skeleton/active'
import Loading from '../../../docs/src/examples/skeleton/loading'
import Button from '../../../docs/src/examples/skeleton/button'
import AvatarPart from '../../../docs/src/examples/skeleton/avatar-part'
import Input from '../../../docs/src/examples/skeleton/input'
import Node from '../../../docs/src/examples/skeleton/node'
import Style from '../../../docs/src/examples/skeleton/style'
import Theme from '../../../docs/src/examples/skeleton/theme'

export default function SkeletonPage() {
  return <div class="space-y-8">
    <section data-skeleton-demo="basic">
      <h3 class="text-base font-medium mb-4">基本使用</h3>
      <Basic />
    </section>
    <section data-skeleton-demo="composition">
      <h3 class="text-base font-medium mb-4">标题与段落</h3>
      <Composition />
    </section>
    <section data-skeleton-demo="width">
      <h3 class="text-base font-medium mb-4">行数与宽度</h3>
      <Width />
    </section>
    <section data-skeleton-demo="avatar">
      <h3 class="text-base font-medium mb-4">头像组合</h3>
      <Avatar />
    </section>
    <section data-skeleton-demo="active">
      <h3 class="text-base font-medium mb-4">动画与圆角</h3>
      <Active />
    </section>
    <section data-skeleton-demo="loading">
      <h3 class="text-base font-medium mb-4">切换真实内容</h3>
      <Loading />
    </section>
    <section data-skeleton-demo="button">
      <h3 class="text-base font-medium mb-4">按钮占位</h3>
      <Button />
    </section>
    <section data-skeleton-demo="avatar-part">
      <h3 class="text-base font-medium mb-4">独立头像</h3>
      <AvatarPart />
    </section>
    <section data-skeleton-demo="input">
      <h3 class="text-base font-medium mb-4">输入框占位</h3>
      <Input />
    </section>
    <section data-skeleton-demo="node">
      <h3 class="text-base font-medium mb-4">自定义占位</h3>
      <Node />
    </section>
    <section data-skeleton-demo="style">
      <h3 class="text-base font-medium mb-4">自定义样式</h3>
      <Style />
    </section>
    <section data-skeleton-demo="theme">
      <h3 class="text-base font-medium mb-4">主题与动画</h3>
      <Theme />
    </section>
  </div>
}
