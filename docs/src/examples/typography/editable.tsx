import { createSignal } from 'solid-js'
import { Paragraph } from 'upthrust-ui/source/Typography'
export default function Editable() {
  const [text, setText] = createSignal('点击图标编辑项目简介')
  const [event, setEvent] = createSignal('尚未编辑')
  return <><Paragraph editable={{ text: text(), maxLength: 60, onChange: setText, onStart: () => setEvent('正在编辑'), onCancel: () => setEvent('已取消'), onEnd: () => setEvent('已保存'), tooltip: '编辑简介' }}>{text()}</Paragraph><Paragraph editable>非受控文本也可以直接修改。</Paragraph><p role="status">{event()}</p></>
}
