import { createSignal } from 'solid-js'
import Steps from 'upthrust-ui/source/Steps'

const content = '这是一段步骤描述。'

export default function Clickable() {
  const [current, setCurrent] = createSignal(0)
  const [log, setLog] = createSignal<number[]>([])
  const onChange = (value: number) => {
    setCurrent(value)
    setLog(list => [...list, value])
  }
  // 设置 onChange 后，未禁用的步骤可点击，也可以 Tab 聚焦后按 Enter / 空格切换。
  return <div class="flex flex-col gap-lg">
    <div data-case="horizontal"><Steps current={current()} onChange={onChange} items={[
      { title: '第一步', content },
      { title: '第二步', content },
      { title: '第三步', content },
      { title: '禁用', content, disabled: true },
    ]} /></div>
    <div data-case="vertical"><Steps orientation="vertical" current={current()} onChange={onChange} items={[
      { title: '第一步', content },
      { title: '第二步', content },
      { title: '第三步', content },
      { title: '禁用', content, disabled: true },
    ]} /></div>
    <output data-current={current()} data-log={log().join(',')}>current = {String(current())}；onChange: [{log().join(', ')}]</output>
  </div>
}
