import { createSignal } from 'solid-js'
import Masonry from 'upthrust-ui/source/Masonry'

const texts = [
  '瀑布流适合展示高度不一的卡片。',
  '开启 fresh 后，每一项自身的尺寸变化（例如展开更多内容）都会触发重新排布。',
  '点击卡片展开 / 收起。',
  '未开启 fresh 时，只有容器尺寸变化、图片加载和数据变化会触发重新测量。',
  '同一帧内的多次变化会合并为一次测量。',
  '短内容。',
]

/** 可展开的卡片：高度在挂载后才改变，需要 fresh 才能被感知。 */
const Card = (props: { text: string }) => {
  const [open, setOpen] = createSignal(false)
  return <button
    type="button"
    class="w-full p-sm text-left rounded-lg border border-outline-variant bg-surface cursor-pointer text-on-surface"
    aria-expanded={open() ? 'true' : 'false'}
    onClick={() => setOpen(value => !value)}
  >
    <div>{props.text}</div>
    <div class="text-on-surface-variant" hidden={!open()} data-more>
      展开的补充内容：这里的文字让卡片变高，其余卡片随之让位。
    </div>
  </button>
}

export default function Fresh() {
  return <Masonry
    fresh
    columns={3}
    gutter={12}
    items={texts.map((text, key) => ({ key, data: text }))}
    itemRender={({ data }) => <Card text={data!} />}
    data-masonry-fresh
  />
}
