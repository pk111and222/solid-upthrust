import { AutoComplete } from 'upthrust-ui'

export default function Filter() {
  return <div class="flex flex-col gap-3 max-w-sm">
    <AutoComplete aria-label="前缀搜索" defaultValue="s" options={[{ value: 'solid' }, { value: 'signal' }, { value: 'memo' }]}
      filterOption={(text, option) => option.value.startsWith(text)} placeholder="只匹配前缀" />
    <AutoComplete aria-label="全部建议" filterOption={false} options={[{ value: '常用短语' }, { value: '另一条建议' }]} placeholder="输入任意内容，保留全部建议" />
  </div>
}
