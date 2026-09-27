import Statistic, { type StatisticProps, type StatisticSemanticStyles } from 'upthrust-ui/source/Statistic'

// antd 的 styles 还支持函数形式（按 props 计算），这里按 value 预先算好对象。
const stylesByValue = (value: StatisticProps['value']): StatisticSemanticStyles => {
  const num = Number(value ?? 0)
  return Number.isFinite(num) && num < 0
    ? {
        title: { color: '#ff4d4f' },
        content: { color: '#ff7875' },
        value: { 'background-color': '#fff1f0', 'border-radius': '4px', 'padding-inline': '6px', 'user-select': 'none' },
      }
    : {}
}

export default function Semantic() {
  const classNames = { root: 'border-2 border-dashed border-[#ccc] p-md rounded-lg' }
  const prefix = () => <span class="i-mdi-arrow-up inline-block align-[-0.125em]" />
  return <div class="flex flex-col gap-4">
    <Statistic
      classNames={classNames}
      prefix={prefix()}
      title="月活跃用户"
      value={93241}
      styles={{
        title: { color: '#1890ff', 'font-weight': 600 },
        content: { 'font-size': '24px' },
        value: { 'background-color': '#e6f4ff', 'border-radius': '4px', color: '#0958d9', 'padding-inline': '6px', 'user-select': 'none' },
      }}
      suffix="人"
    />
    <Statistic classNames={classNames} prefix={prefix()} title="年度亏损" value={-18.7} precision={1} styles={stylesByValue(-18.7)} suffix="%" />
  </div>
}
