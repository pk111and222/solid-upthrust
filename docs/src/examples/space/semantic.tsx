import Space from 'upthrust-ui/source/Space'

export default function Semantic() {
  return <Space
    separator="|"
    classNames={{ root: 'p-xs rounded bg-on-surface/4', item: 'px-xs rounded-sm bg-primary/15', separator: 'text-primary' }}
    styles={{ item: { 'font-variant-numeric': 'tabular-nums' } }}
    data-space-semantic
  >
    <span>root</span>
    <span>item</span>
    <span>separator</span>
  </Space>
}
