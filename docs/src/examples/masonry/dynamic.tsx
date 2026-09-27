import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Masonry, { type MasonryItem } from 'upthrust-ui/source/Masonry'

const heightOf = (seed: number) => 50 + ((seed * 37) % 7) * 20

export default function Dynamic() {
  let nextKey = 6
  const [items, setItems] = createSignal<MasonryItem<number>[]>(
    Array.from({ length: nextKey }, (_, key) => ({ key, data: heightOf(key) })),
  )
  const add = () => setItems(list => [...list, { key: nextKey, data: heightOf(nextKey++) }])
  const remove = (key: number | string) => setItems(list => list.filter(item => item.key !== key))
  return <div class="flex flex-col gap-md" data-masonry-dynamic>
    <div><Button type="primary" onClick={add}>添加一项</Button></div>
    {/* 新增项在测量完成前保持透明，定位后淡入；已有项平滑移动到新位置。key 必须稳定。 */}
    <Masonry
      columns={4}
      gutter={16}
      items={items()}
      itemRender={({ key, data }) => (
        <div
          class="relative flex items-center justify-center rounded-lg border border-outline-variant bg-surface-variant/40"
          style={{ height: `${data}px` }}
        >
          #{key}
          <button
            type="button"
            aria-label={`删除 #${key}`}
            class="absolute top-1 right-1 size-5 flex items-center justify-center rounded border-0 bg-transparent cursor-pointer text-on-surface-variant hover:text-error"
            onClick={() => remove(key)}
          >
            <span class="i-mdi-close" />
          </button>
        </div>
      )}
    />
  </div>
}
