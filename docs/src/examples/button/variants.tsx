import Button from 'upthrust-ui/source/Button'
import { For } from 'solid-js'

export default function Demo() {
  return <div class="flex flex-wrap gap-3"><For each={['solid','outlined','filled','dashed','text','link'] as const}>{variant => <For each={['default','primary','danger'] as const}>{color => <Button variant={variant} color={color}>{variant} / {color}</Button>}</For>}</For><Button type="primary" variant="dashed" color="primary" danger>危险操作</Button></div>
}
