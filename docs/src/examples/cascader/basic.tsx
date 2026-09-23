import { createSignal } from 'solid-js'
import Cascader, { type CascaderOption } from 'upthrust-ui/source/Cascader'

const options: CascaderOption[] = [{ value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州', children: [{ value: 'xh', label: '西湖' }, { value: 'bj', label: '滨江' }] }] }, { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] }]
export default function Basic() {
  const [value, setValue] = createSignal<string[] | undefined>()
  return <div class="flex flex-col gap-3 max-w-sm"><Cascader aria-label="地区" options={options} value={value()} onChange={v => setValue(v as string[] | undefined)} placeholder="选择地区" /><output>{value()?.join(' / ') || '未选择'}</output></div>
}
