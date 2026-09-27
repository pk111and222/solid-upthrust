import { createSignal } from 'solid-js'
import { Paragraph } from 'upthrust-ui/source/Typography'
import Button from 'upthrust-ui/source/Button'
export default function Controlled() {
  const [editing, setEditing] = createSignal(false)
  const [text, setText] = createSignal('由外部按钮打开编辑')
  return <><Button onClick={() => setEditing(true)}>开始编辑</Button><Paragraph editable={{ text: text(), editing: editing(), onStart: () => setEditing(true), onChange: setText, onEnd: () => setEditing(false), onCancel: () => setEditing(false) }}>{text()}</Paragraph></>
}
