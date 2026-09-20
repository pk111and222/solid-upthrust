import { createSignal } from 'solid-js'
import { InputTextArea as TextArea } from 'upthrust-ui/source/Input'
export default function Demo() {
  const [value, setValue] = createSignal('备注')
  return <div class="space-y-3"><label for="input-memo">备注</label><TextArea id="input-memo" name="memo" value={value()} onChange={setValue} rows={4} maxLength={100} showCount allowClear placeholder="填写备注" /><TextArea readonly defaultValue="只读备注" rows={2} /><output>内容：{value()}</output></div>
}
