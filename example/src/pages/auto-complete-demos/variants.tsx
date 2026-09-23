import { AutoComplete } from 'upthrust-ui'

export default function Variants() {
  return <div class="flex flex-col gap-3 max-w-sm">
    <AutoComplete aria-label="小尺寸" size="small" placeholder="小尺寸" />
    <AutoComplete aria-label="中尺寸" size="middle" placeholder="中尺寸" />
    <AutoComplete aria-label="大尺寸" size="large" placeholder="大尺寸" />
    <AutoComplete aria-label="错误状态" status="error" placeholder="错误状态" />
    <AutoComplete aria-label="警告状态" status="warning" placeholder="警告状态" />
    <AutoComplete aria-label="禁用状态" disabled defaultValue="不可编辑" />
  </div>
}
