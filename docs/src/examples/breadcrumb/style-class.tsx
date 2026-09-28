import Breadcrumb, { type BreadcrumbClassNames, type BreadcrumbProps } from 'upthrust-ui/source/Breadcrumb'

const classNames: BreadcrumbClassNames = { root: 'p-[8px] rounded bg-on-surface/4', item: 'font-medium' }

export default function StyleClass() {
  // styles 可以是函数：参数 props 为合并默认值后的 Breadcrumb 属性。
  const styles: BreadcrumbProps['styles'] = info => ({
    separator: { color: info.props.separator === '>' ? '#fa541c' : '#1677ff' },
  })
  return (
    <div class="flex flex-col gap-3">
      <Breadcrumb separator=">" classNames={classNames} styles={styles} items={[{ title: '首页' }, { title: '应用中心', href: '#style-class' }, { title: '某应用' }]} />
      <output class="text-[12px] text-on-surface/45">classNames / styles 的语义节点：root、item、separator。</output>
    </div>
  )
}
