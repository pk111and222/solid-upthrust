import { type Component, createSignal, createMemo } from 'solid-js'
import { Descriptions, Divider, Button, Space, Typography } from 'upthrust-ui'
import type { DescriptionsItem } from 'upthrust-ui'

const { Text } = Typography

// IMPORTANT: each Descriptions demo gets its OWN items (fresh JSX elements).
// Solid moves a real DOM node when the SAME JSX element is inserted into
// multiple parents — sharing one items array across several instances would
// leave only the LAST instance with content.
const makeBasicItems = (): DescriptionsItem[] => [
  { label: 'UserName', children: 'Zhou Maomao' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
  { label: 'Address', children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China' },
  { label: 'Remark', children: 'empty' },
]

const makeBorderedItems = (): DescriptionsItem[] => [
  { label: 'UserName', children: 'Zhou Maomao' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
  { label: 'Address', children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China' },
  { label: 'Remark', children: 'empty' },
]

const spanItems: DescriptionsItem[] = [
  { label: 'Product', children: 'Cloud Database', span: 'filled' },
  { label: 'Billing Mode', children: 'Prepaid' },
  { label: 'Automatic Renewal', children: 'YES' },
  { label: 'Order time', children: '2026-08-26 12:00:00' },
  { label: 'Usage Time', children: '2026-08-26 ~ 2027-08-26', span: 'filled' },
  { label: 'Status', children: 'Running' },
  { label: 'Negotiated Amount', children: '$80.00' },
  { label: 'Discount', children: '$20.00' },
  { label: 'Official Receipts', children: '$60.00' },
  { label: 'Config Info', children: 'Some configurable info', span: 2 },
]

const verticalItems: DescriptionsItem[] = [
  { label: 'UserName', children: 'Zhou Maomao' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
  { label: 'Address', children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China' },
  { label: 'Remark', children: 'empty' },
]

const customItems: DescriptionsItem[] = [
  {
    label: <Text class="text-primary">自定义标签</Text>,
    children: <Text strong>强调内容</Text>,
  },
  { label: '无冒号', children: '该项关闭冒号', colon: false },
  { label: '普通项', children: '默认 span' },
]

const DescriptionsPage: Component = () => {
  const [column, setColumn] = createSignal(3)
  const [bordered, setBordered] = createSignal(false)
  const [vertical, setVertical] = createSignal(false)
  const [size, setSize] = createSignal<'small' | 'middle' | 'large'>('middle')

  const dynamicItems = createMemo<DescriptionsItem[]>(() => [
    { label: 'UserName', children: 'Zhou Maomao' },
    { label: 'Telephone', children: '1810000000' },
    { label: 'Live', children: 'Hangzhou, Zhejiang' },
    { label: 'Address', children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang' },
    { label: 'Remark', children: 'empty' },
  ])

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Descriptions 描述列表</h2>
      <p class="text-on-surface-variant mb-6">展示多个字段信息的只读列表，对齐 antd API。纯 UI 物料（无 headless）。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用（默认无边框）</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Descriptions
          title="User Info"
          extra={<Button size="small" variant="outlined">刷新</Button>}
          items={makeBasicItems()}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带边框（bordered）</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Descriptions title="User Info" bordered items={makeBorderedItems()} />
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        label 列灰底、单元格间 hairline；列边界在同一竖线上对齐。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">span 跨列与 filled</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Descriptions title="Order Info" bordered items={spanItems} column={3} />
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        <code>span: 'filled'</code> 占满本行剩余列；<code>span: 2</code> 固定跨两列。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">垂直布局（vertical）</h3>
      <div class="grid gap-8 md:grid-cols-2">
        <div class="rounded-lg border border-outline-variant p-4 bg-surface">
          <p class="mb-2 text-sm text-on-surface-variant">无边框</p>
          <Descriptions layout="vertical" items={verticalItems} column={2} />
        </div>
        <div class="rounded-lg border border-outline-variant p-4 bg-surface">
          <p class="mb-2 text-sm text-on-surface-variant">带边框</p>
          <Descriptions layout="vertical" bordered items={verticalItems} column={2} />
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">响应式 column（bordered 必选）</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
          items={dynamicItems()}
        />
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        xs=1 / sm=2 / md=3 / lg=4，拖动窗口宽度观察每行列数变化。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">动态调参</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Space wrap class="mb-4">
          <Button size="small" variant="outlined" onClick={() => setColumn(c => c >= 4 ? 1 : c + 1)}>
            column = {column()}
          </Button>
          <Button size="small" variant="outlined" onClick={() => setBordered(b => !b)}>
            bordered = {String(bordered())}
          </Button>
          <Button size="small" variant="outlined" onClick={() => setVertical(v => !v)}>
            vertical = {String(vertical())}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSize(s => s === 'small' ? 'middle' : s === 'middle' ? 'large' : 'small')}
          >
            size = {size()}
          </Button>
        </Space>
        <Descriptions
          column={column()}
          bordered={bordered()}
          layout={vertical() ? 'vertical' : 'horizontal'}
          size={size()}
          items={dynamicItems()}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义渲染与 colon 覆盖</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Descriptions column={2} items={customItems} />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">语义化样式与 classNames/styles</h3>
      <div class="rounded-lg border border-outline-variant p-4 bg-surface">
        <Descriptions
          bordered
          column={2}
          items={makeBasicItems()}
          classNames={{ label: 'font-medium' }}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">典型详情页组合</h3>
      <div class="rounded-lg border border-outline-variant bg-surface">
        <div class="px-4 pt-4">
          <Descriptions
            title="用户信息"
            extra={<Button size="small" variant="solid">编辑</Button>}
            bordered
            column={3}
            items={[
              { label: '姓名', children: '张三' },
              { label: '部门', children: '平台研发部' },
              { label: '职级', children: 'P7' },
              { label: '邮箱', children: 'zhangsan@example.com' },
              { label: '电话', children: '+86 138 0000 0000' },
              { label: '工号', children: '10086' },
              { label: '入职时间', children: '2023-03-15' },
              { label: '状态', children: <Text class="text-[#52c41a]">在职</Text> },
              { label: '备注', children: '核心维护者' },
            ]}
          />
        </div>
        <Divider class="my-0" />
        <div class="p-4">
          <Descriptions
            title="权限信息"
            column={2}
            items={[
              { label: '角色', children: '管理员' },
              { label: '数据范围', children: '全部数据' },
              { label: '生效时间', children: '2026-01-01' },
              { label: '过期时间', children: '永久' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export default DescriptionsPage
