import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Fields() {
  const [events, setEvents] = createSignal<string[]>([])
  return <Form onValuesChange={(changed, all) => setEvents(items => [...items, `${JSON.stringify(changed)} / ${JSON.stringify(all)}`])} onFieldsChange={fields => setEvents(items => [...items, `fields:${fields.length}`])}><FormItem name="title" label="标题"><Input /></FormItem><Button htmlType="button" onClick={() => setEvents([])}>清空事件</Button><pre>{events().join('\n')}</pre></Form>
}
