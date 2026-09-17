import Button from 'upthrust-ui/source/Button'
import { createSignal } from 'solid-js'
import type { ButtonIns } from 'upthrust-ui/source/Button'

export default function Demo() {
  const [count,setCount]=createSignal(0)
  let instance: ButtonIns | undefined
  return <div class="flex flex-wrap items-center gap-3"><Button ref={value => instance=value} id="button-native-demo" class="font-semibold" style={{'letter-spacing':'1px'}} aria-label="计数" onClick={() => setCount(count()+1)}>计数</Button><Button onClick={() => instance?.click()}>通过实例点击</Button><output>点击次数：{count()}</output></div>
}
