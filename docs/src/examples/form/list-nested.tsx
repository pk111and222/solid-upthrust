import { For, Show, createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem, FormList } from 'upthrust-ui/source/Form'

export default function NestedList() {
  const [result, setResult] = createSignal('尚未提交')
  return <Form initialValues={{ users: [{ name: '张三', phones: [{ value: '13800138000' }] }] }} onFinish={values => setResult(JSON.stringify(values))}>
    <FormList name="users">{(users, operations) => <>
      <div class="grid gap-4 mb-4">
        <Show when={!users().length}><p class="rounded-lg bg-surface-container-low p-4 text-on-surface-variant">暂无联系人，点击“新增用户”开始填写。</p></Show>
        <For each={users()} keyed>{user => <section class="rounded-lg border border-outline-variant p-4" aria-label="联系人">
          <div class="mb-4 flex items-center justify-between gap-2"><h4 class="font-medium">联系人</h4><Button variant="text" danger onClick={() => operations.remove(user.name)}>删除用户</Button></div>
          <FormItem name={[user.name, 'name']} label="姓名" labelWidth="64px" rules={[{ required: true, message: '请输入姓名' }]}><Input placeholder="请输入联系人姓名" /></FormItem>
          <FormList name={[user.name, 'phones']}>{(phones, phoneOperations) => <div class="grid gap-3">
            <For each={phones()} keyed>{phone => <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
              <FormItem name={[phone.name, 'value']} label="电话" labelWidth="64px" class="!mb-0 min-w-0 w-full sm:flex-1"><Input placeholder="手机号或座机号码" /></FormItem>
              <Button class="self-end shrink-0 sm:self-start" danger variant="text" onClick={() => phoneOperations.remove(phone.name)}>删除电话</Button>
            </div>}</For>
            <Button variant="dashed" onClick={() => phoneOperations.add({ value: '' })}>新增电话</Button>
          </div>}</FormList>
        </section>}</For>
      </div>
      <Flex gap={8} wrap="wrap"><Button variant="dashed" onClick={() => operations.add({ name: '', phones: [{ value: '' }] })}>新增用户</Button><Button htmlType="submit" variant="solid">提交联系人</Button><Button htmlType="reset">重置</Button></Flex>
    </>}</FormList>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </Form>
}
