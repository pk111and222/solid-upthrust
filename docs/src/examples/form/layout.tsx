import Input from 'upthrust-ui/source/Input'
import Select from 'upthrust-ui/source/Select'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem } from 'upthrust-ui/source/Form'

const departments = [{ label: '研发团队', value: 'engineering' }, { label: '产品团队', value: 'product' }]

export default function Layout() {
  return <div class="grid gap-6">
    <section class="rounded-lg border border-outline-variant p-4" aria-label="水平布局">
      <h4 class="mb-1 font-medium">水平布局</h4>
      <p class="mb-4 text-sm text-on-surface-variant">标签在左侧，统一标签宽度适合信息录入。</p>
      <Form layout="horizontal" labelWidth="80px" class="max-w-lg">
        <FormItem name="name" label="姓名"><Input placeholder="请输入姓名" /></FormItem>
        <FormItem name="email" label="邮箱"><Input placeholder="name@example.com" /></FormItem>
        <FormItem name="department" label="团队"><Select options={departments} placeholder="请选择团队" /></FormItem>
        <Flex gap={8} wrap="wrap"><Button variant="solid">保存</Button><Button htmlType="reset">重置</Button></Flex>
      </Form>
    </section>
    <section class="rounded-lg border border-outline-variant p-4" aria-label="垂直布局">
      <h4 class="mb-1 font-medium">垂直布局</h4>
      <p class="mb-4 text-sm text-on-surface-variant">标签在上方，为较长的名称和窄屏留出空间。</p>
      <Form layout="vertical" class="max-w-lg">
        <FormItem name="name" label="姓名"><Input placeholder="请输入姓名" /></FormItem>
        <FormItem name="email" label="邮箱"><Input placeholder="name@example.com" /></FormItem>
        <FormItem name="department" label="团队"><Select options={departments} placeholder="请选择团队" /></FormItem>
        <Flex gap={8} wrap="wrap"><Button variant="solid">保存</Button><Button htmlType="reset">重置</Button></Flex>
      </Form>
    </section>
    <section class="rounded-lg border border-outline-variant p-4" aria-label="内联布局">
      <h4 class="mb-1 font-medium">内联布局</h4>
      <p class="mb-4 text-sm text-on-surface-variant">字段与操作并排，空间不足时自动换行，适合筛选。</p>
      <Form layout="inline">
        <FormItem name="name" label="姓名" class="w-full sm:w-52"><Input placeholder="请输入姓名" /></FormItem>
        <FormItem name="department" label="团队" class="w-full sm:w-52"><Select options={departments} placeholder="请选择团队" /></FormItem>
        <Flex gap={8} wrap="wrap"><Button variant="solid">查询</Button><Button htmlType="reset">重置</Button></Flex>
      </Form>
    </section>
  </div>
}
