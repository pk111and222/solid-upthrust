import Button from 'upthrust-ui/source/Button'
import { createSignal } from 'solid-js'

export default function Demo() {
  const [count,setCount]=createSignal(0)
  return <form class="flex flex-wrap items-center gap-3" onSubmit={event => {event.preventDefault(); setCount(count()+1)}}><input aria-label="名称" name="name" value="示例" class="border rounded px-2 h-8" /><Button>普通按钮</Button><Button htmlType="submit" name="action" value="save" type="primary">提交</Button><Button htmlType="reset">重置</Button><output>提交次数：{count()}</output></form>
}
