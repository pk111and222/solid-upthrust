import Select from 'upthrust-ui/source/Select'

const options = [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }]
export default function Variants() {
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="小尺寸" size="small" options={options} defaultValue="apple" />
    <Select aria-label="中尺寸" size="middle" options={options} defaultValue="apple" />
    <Select aria-label="大尺寸" size="large" options={options} defaultValue="apple" />
    <Select aria-label="小尺寸可清空" size="small" options={options} defaultValue="apple" allowClear />
    <Select aria-label="大尺寸可清空" size="large" options={options} defaultValue="apple" allowClear />
    <Select aria-label="错误状态" status="error" options={options} defaultValue="apple" />
    <Select aria-label="警告状态" status="warning" options={options} defaultValue="apple" />
    <Select aria-label="禁用选择" disabled options={options} defaultValue="apple" />
    <Select aria-label="加载状态" loading options={options} />
  </div>
}
