import Anchor from 'upthrust-ui/source/Anchor'

export default function Replace() {
  // replace：点击时用 history.replaceState 写 hash，不新增历史记录（浏览器后退不会逐个回到锚点）。
  return <Anchor
    affix={false}
    showInkInFixed
    replace
    items={[
      { key: 'part-1', href: '#anchor-basic-part-1', title: 'Part 1' },
      { key: 'part-2', href: '#anchor-basic-part-2', title: 'Part 2' },
      { key: 'part-3', href: '#anchor-basic-part-3', title: 'Part 3' },
    ]}
  />
}
