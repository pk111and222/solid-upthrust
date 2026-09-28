import Anchor from 'upthrust-ui/source/Anchor'

export default function Static() {
  // affix={false}：不固定，vertical 默认不显示 ink（showInkInFixed 可打开）；嵌套链接通过 children 描述。
  return <Anchor
    affix={false}
    items={[
      { key: 'components', href: '#anchor-basic-part-1', title: 'Part 1' },
      {
        key: 'nested', href: '#anchor-basic-part-2', title: 'Part 2',
        children: [
          { key: 'nested-a', href: '#anchor-basic-part-3', title: 'Part 3（嵌套）' },
        ],
      },
    ]}
  />
}
