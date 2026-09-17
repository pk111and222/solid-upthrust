import Button from 'upthrust-ui/source/Button'

export default function Demo() {
  return <div class="flex flex-wrap gap-3 rounded bg-slate-700 p-4"><Button ghost>默认</Button><Button type="primary" ghost>主要</Button><Button danger ghost>危险</Button></div>
}
