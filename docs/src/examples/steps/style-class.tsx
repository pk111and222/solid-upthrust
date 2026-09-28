import Steps, { type StepsClassNames, type StepsProps } from 'upthrust-ui/source/Steps'

const classNames: StepsClassNames = { itemTitle: 'font-semibold', itemContent: 'italic' }

export default function StyleClass() {
  // styles 可以是函数：参数 props 为合并默认值后的 Steps 属性。
  const styles: StepsProps['styles'] = info => ({
    root: { padding: '12px', 'border-radius': '8px', 'background-color': info.props.size === 'small' ? '#f6ffed' : '#fafafa' },
    itemRail: { 'border-top-style': 'dashed' },
    itemSubtitle: { color: '#fa541c' },
  })
  return <Steps current={1} classNames={classNames} styles={styles} items={[
    { title: '已完成', content: '语义化 classNames' },
    { title: '进行中', subTitle: '子标题', content: '函数式 styles' },
    { title: '待处理', content: '虚线连接线', class: 'opacity-80' },
  ]} />
}
