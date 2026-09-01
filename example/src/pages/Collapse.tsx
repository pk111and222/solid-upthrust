import { type Component, createSignal } from 'solid-js'
import { Collapse, Divider, Button } from 'upthrust-ui'
import type { CollapseItem } from 'upthrust-ui'

const text = `
  A dog is a type of domesticated animal. Known for its loyalty and
  faithfulness, it can be found as a welcome guest in many households
  across the world.
`

// IMPORTANT: each Collapse demo gets its OWN items (fresh JSX elements).
// Solid moves a real DOM node when the SAME JSX element is inserted into
// multiple parents — sharing one items array across several Collapse
// instances would leave only the LAST instance with content.
const makeBasicItems = (): CollapseItem[] => [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p>{text}</p>,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>{text}</p>,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>{text}</p>,
  },
]

const disabledItems: CollapseItem[] = [
  { key: '1', label: '可点击的面板', children: <p>{text}</p> },
  {
    key: '2',
    label: '禁用的面板（不可展开）',
    disabled: true,
    children: <p>{text}</p>,
  },
  { key: '3', label: '可点击的面板', children: <p>{text}</p> },
]

const CollapsePage: Component = () => {
  const [activeKeys, setActiveKeys] = createSignal<Array<string | number>>(['1'])
  const [accordionKey, setAccordionKey] = createSignal<Array<string | number>>(['1'])

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Collapse 折叠面板</h2>
      <p class="text-on-surface-variant mb-6">可以折叠/展开的内容区域。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Collapse items={makeBasicItems()} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">手风琴模式（accordion）</h3>
      <p class="text-sm text-on-surface-variant mb-2">一次只允许一个面板展开，展开另一个会自动收起上一个。</p>
      <Collapse
        accordion
        items={makeBasicItems()}
        activeKey={accordionKey()}
        onChange={(keys) => setAccordionKey(keys)}
      />
      <p class="mt-2 text-sm text-on-surface-variant">
        受控 activeKey：[{accordionKey().join(', ')}]
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控用法</h3>
      <Collapse
        items={makeBasicItems()}
        activeKey={activeKeys()}
        onChange={(keys) => setActiveKeys(keys)}
      />
      <div class="mt-4 flex gap-2">
        <Button size="small" onClick={() => setActiveKeys(['1', '2', '3'])}>全部展开</Button>
        <Button size="small" onClick={() => setActiveKeys([])}>全部收起</Button>
        <Button size="small" onClick={() => setActiveKeys(['2'])}>只开第二个</Button>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">幽灵模式（ghost）</h3>
      <div class="bg-surface-variant p-[16px] rounded-lg">
        <Collapse ghost defaultActiveKey={['1']} items={makeBasicItems()} />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用面板</h3>
      <Collapse defaultActiveKey={['1']} items={disabledItems} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义展开图标与位置</h3>
      <Collapse
        items={makeBasicItems()}
        expandIcon={({ isActive }) => (
          <span class={`inline-block text-[16px] transition-transform duration-slow ease-upthrust ${isActive ? 'i-mdi-tune-variant rotate-90' : 'i-mdi-tune'}`} />
        )}
      />
      <div class="mt-4" />
      <Collapse items={makeBasicItems()} expandIconPosition="start" />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">隐藏展开图标 & 面板额外内容（extra）</h3>
      <Collapse
        defaultActiveKey={['1']}
        items={makeBasicItems().map((item, i) => ({
          ...item,
          showExpandIcon: i !== 1,
          extra: (
            <span
              class={
                i === 0
                  ? 'text-[12px] text-primary bg-primary-container/15 rounded px-[6px] py-[2px]'
                  : i === 1
                    ? 'text-[12px] text-on-surface-variant bg-on-surface/6 rounded px-[6px] py-[2px]'
                    : 'text-[12px] text-[#d46b08] bg-[#faad14]/10 rounded px-[6px] py-[2px]'
              }
              onClick={(e) => e.stopPropagation()}
            >
              extra {i + 1}
            </span>
          ),
        }))}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">labelRender 自定义渲染</h3>
      <Collapse
        defaultActiveKey={['1']}
        items={makeBasicItems().map((item, i) => ({
          ...item,
          labelRender: ({ isActive }) => (
            <span class={isActive ? 'text-primary font-medium' : ''}>
              {item.label as string} {isActive ? '（展开中）' : ''}
            </span>
          ),
        }))}
      />
    </div>
  )
}

export default CollapsePage
