import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'
import Button from 'upthrust-ui/source/Button'

const options = [{ label: '甲', value: 1 }, { label: '乙', value: 2 }]
export default function Advanced() {
  const [open, setOpen] = createSignal(false)
  const [result, setResult] = createSignal('尚未选择')
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="受控弹层" name="choice" options={options} open={open()} onOpenChange={setOpen}
      labelInValue onChange={value => setResult(JSON.stringify(value))} virtual={false}
      dropdownRender={menu => <div>{menu}<p class="px-3">自定义菜单尾部</p></div>} />
    <Button onClick={() => setOpen(value => !value)}>切换弹层</Button>
    <output>{result()}</output>
  </div>
}
