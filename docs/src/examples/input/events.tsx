import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
export default function Demo() {
  const [event, setEvent] = createSignal('未操作')
  let input: HTMLInputElement | undefined
  return <div class="space-y-3"><Input placeholder="输入中文后按 Enter" ref={el => { input = el }} onChange={value => setEvent(`change:${value}`)} onFocus={() => setEvent('focus')} onBlur={() => setEvent('blur')} onPressEnter={() => setEvent('Enter')} onCompositionStart={() => setEvent('组合开始')} onCompositionEnd={() => setEvent('组合结束')} showCount={{ formatter: ({count}) => `${count} 个 UTF-16 单元` }} /><Button onClick={() => input?.focus()}>聚焦输入框</Button><output>{event()}</output></div>
}
