import { createSignal } from 'solid-js'
import { Transfer, Divider, Switch, Form, FormItem, Button, type TransferKey } from 'upthrust-ui'
import type { FormInstance } from 'upthrust-competence'

const data = Array.from({ length: 12 }, (_, index) => ({ key: index, title: `成员 ${index + 1}`, description: index % 2 ? '研发团队' : '设计团队', disabled: index === 3 }))
export default function TransferPage() {
  const [keys, setKeys] = createSignal<TransferKey[]>([1, 4])
  const [selected, setSelected] = createSignal<TransferKey[]>([])
  const [disabled, setDisabled] = createSignal(false)
  const [log, setLog] = createSignal('')
  const [result, setResult] = createSignal('')
  let form: FormInstance | undefined
  return <div class="p-6 max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">Transfer 穿梭框</h2>
    <p class="text-on-surface-variant mb-6">选择待分配的成员后移入右侧。列表勾选与最终分配结果独立管理。</p>
    <h3 class="text-lg font-semibold mb-3">受控选择、搜索与禁用</h3>
    <div class="flex items-center gap-2 mb-3 text-sm"><Switch checked={disabled()} onChange={setDisabled} />禁用整个组件</div>
    <Transfer dataSource={data} targetKeys={keys()} selectedKeys={selected()} disabled={disabled()} showSearch
      titles={['可分配成员', '项目成员']} operations={['添加', '移除']}
      onSelectChange={(left, right) => setSelected([...left, ...right])}
      onChange={(next, direction, moved) => { setKeys(next); setLog(`${direction === 'right' ? '添加' : '移除'} ${moved.length} 位成员`) }}
      onSearch={(direction, query) => setLog(`搜索${direction === 'left' ? '左侧' : '右侧'}：${query}`)} />
    <p class="text-sm text-on-surface-variant">目标 keys：{JSON.stringify(keys())}；{log()}</p>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">单向穿梭、自定义内容与底部</h3>
    <Transfer dataSource={data} defaultTargetKeys={[0, 3]} defaultSelectedKeys={[2]} oneWay showSearch
      searchPlaceholder="按姓名或团队搜索" filterOption={(query, item) => `${item.title} ${item.description}`.includes(query)}
      render={item => <span>{item.title}<span class="ml-2 text-[12px] text-on-surface-variant">{item.description}</span></span>}
      footer={direction => direction === 'left' ? '成员 4 已锁定，不参与移动' : '点击 × 移除成员'} listStyle={{ width: '250px', height: '280px' }} />
    <Divider />
    <h3 class="text-lg font-semibold mb-3">空列表与隐藏全选</h3>
    <Transfer dataSource={[]} showSelectAll={false} notFoundContent="暂无可分配资源" listStyle={{ height: '150px' }} status="warning" />
    <Divider />
    <h3 class="text-lg font-semibold mb-3">表单校验</h3>
    <Form ref={value => { form = value }} initialValues={{ members: [] }} onFinish={values => setResult(JSON.stringify(values))}>
      <FormItem name="members" label="项目成员" rules={[{ type: 'array', required: true, min: 1, message: '请至少添加一位成员' }]}>
        <Transfer dataSource={data} />
      </FormItem>
      <Button variant="solid" onClick={() => { void form?.submit().catch(() => {}) }}>提交</Button>
    </Form>
    <p class="text-sm text-on-surface-variant" role="status">{result()}</p>
  </div>
}
