import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Preserve() {
  const [visible, setVisible] = createSignal(true)
  return <><Button class="mb-4" onClick={() => setVisible(v => !v)}>切换字段</Button><Form initialValues={{ keep: '保留', clear: '清除' }}><FormItem name="keep" label="preserve 默认"><Input /></FormItem>{visible() && <FormItem name="clear" label="preserve=false" preserve={false}><Input /></FormItem>}</Form></>
}
