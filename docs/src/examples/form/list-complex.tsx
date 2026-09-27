import { For, Show, createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem, FormList } from 'upthrust-ui/source/Form'

export default function ComplexList() {
  const [result, setResult] = createSignal('尚未提交')
  return <Form layout="vertical" initialValues={{ sections: [{ title: '办公用品', items: [{ name: '笔记本', quantity: 2 }] }] }} onFinish={values => setResult(JSON.stringify(values))}>
    <FormList name="sections">{(fields, operations) => <>
      <div class="grid gap-4 mb-4">
        <Show when={!fields().length}><p class="rounded-lg bg-surface-container-low p-4 text-on-surface-variant">暂无区块，新增后可继续添加明细。</p></Show>
        <For each={fields()} keyed>{field => <section class="rounded-lg border border-outline-variant p-4" aria-label="采购区块">
          <div class="mb-4 flex items-center justify-between gap-2"><h4 class="font-medium">采购区块</h4><Button danger variant="text" onClick={() => operations.remove(field.name)}>删除区块</Button></div>
          <FormItem name={[field.name, 'title']} label="标题" rules={[{ required: true, message: '请输入区块标题' }]}><Input placeholder="例如：办公用品" /></FormItem>
          <FormList name={[field.name, 'items']}>{(items, itemOperations) => <div class="grid gap-3">
            <For each={items()} keyed>{item => <div class="flex flex-wrap items-start gap-3 rounded bg-surface-container-low p-3">
              <FormItem name={[item.name, 'name']} label="物品名称" class="!mb-0 min-w-0 w-full sm:w-auto sm:flex-1" rules={[{ required: true, message: '请输入物品名称' }]}><Input placeholder="物品名称" /></FormItem>
              <FormItem name={[item.name, 'quantity']} label="数量" class="!mb-0 w-24"><InputNumber min={1} /></FormItem>
              <FormItem label={<span class="invisible" aria-hidden="true">操作</span>} class="!mb-0 shrink-0"><Button danger variant="text" onClick={() => itemOperations.remove(item.name)}>删除明细</Button></FormItem>
            </div>}</For>
            <Button variant="dashed" onClick={() => itemOperations.add({ name: '', quantity: 1 })}>新增明细</Button>
          </div>}</FormList>
        </section>}</For>
      </div>
      <Flex gap={8} wrap="wrap"><Button variant="dashed" onClick={() => operations.add({ title: '', items: [{ name: '', quantity: 1 }] })}>新增区块</Button><Button htmlType="submit" variant="solid">提交采购单</Button><Button htmlType="reset">重置</Button></Flex>
    </>}</FormList>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </Form>
}
