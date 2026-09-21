import { createSignal } from 'solid-js'
import Checkbox, { CheckboxGroup, type CheckboxOption } from 'upthrust-ui/source/Checkbox'
import Button from 'upthrust-ui/source/Button'
export default function Group() {
 const options: CheckboxOption[] = [{label:'苹果',value:'apple'},{label:'香蕉',value:'banana'},{label:'樱桃',value:'cherry',disabled:true}]
 const [value, setValue] = createSignal<Array<string | number>>(['apple'])
 const [disabled, setDisabled] = createSignal(false)
 const enabled = options.filter(option => !option.disabled).map(option => option.value)
 const all = () => enabled.every(v => value().includes(v))
 const partial = () => !all() && enabled.some(v => value().includes(v))
 return <div class="flex flex-col gap-3">
  <Checkbox checked={all()} indeterminate={partial()} disabled={disabled()} onChange={checked => setValue(checked ? enabled : [])}>全选水果</Checkbox>
  <CheckboxGroup name="fruits" value={value()} onChange={setValue} disabled={disabled()} options={options} />
  <Button onClick={() => setDisabled(!disabled())}>切换组禁用</Button>
  <output>选择：{value().join(',')}</output>
 </div>
}
