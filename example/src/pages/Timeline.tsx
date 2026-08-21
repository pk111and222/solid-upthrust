import { type Component } from 'solid-js'
import { Timeline, Divider } from 'upthrust-ui'

const baseItems = [
  { content: '创建项目 2026-08-18' },
  { content: '提交初版设计 2026-08-19', color: 'gray' },
  { content: '通过评审 2026-08-20', color: 'green' },
  { content: '发布上线（进行中）', color: 'red' },
]

const titleItems = [
  { title: '08-18', content: '创建项目' },
  { title: '08-19', content: '提交设计稿' },
  { title: '08-20', content: '通过评审', color: 'green' },
]

const TimelinePage: Component = () => (
  <div class="max-w-4xl p-6">
    <h2 class="mb-4 text-2xl font-bold">Timeline 时间轴</h2>
    <p class="mb-6 text-on-surface-variant">按时间顺序展示信息。</p>

    <h3 class="mb-3 text-lg font-semibold">基本使用</h3>
    <Timeline items={baseItems} />

    <Divider />

    <h3 class="mb-3 text-lg font-semibold">圆点颜色与样式</h3>
    <div class="grid gap-8 md:grid-cols-2">
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">outlined（默认）</p>
        <Timeline
          items={[
            { content: '蓝色（默认）' },
            { content: '绿色', color: 'green' },
            { content: '红色', color: 'red' },
            { content: '灰色', color: 'gray' },
            { content: '自定义 #faad14', color: '#faad14' },
          ]}
        />
      </div>
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">filled</p>
        <Timeline
          variant="filled"
          items={[
            { content: '蓝色（默认）' },
            { content: '绿色', color: 'green' },
            { content: '红色', color: 'red' },
            { content: '灰色', color: 'gray' },
            { content: '自定义 #faad14', color: '#faad14' },
          ]}
        />
      </div>
    </div>

    <Divider />

    <h3 class="mb-3 text-lg font-semibold">自定义图标与加载状态</h3>
    <Timeline
      items={[
        { content: '默认圆点' },
        { icon: <span class="i-mdi-check-circle text-[18px]" />, content: '自定义成功图标' },
        { icon: <span class="i-mdi-alert-circle text-[18px]" />, color: 'red', content: '自定义警示图标' },
        { loading: true, content: '正在处理…' },
      ]}
    />

    <Divider />

    <h3 class="mb-3 text-lg font-semibold">纵向布局</h3>
    <div class="grid gap-8 md:grid-cols-2">
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">mode="start"</p>
        <Timeline items={titleItems} titleSpan="35%" />
      </div>
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">mode="end"</p>
        <Timeline mode="end" items={titleItems} titleSpan="35%" />
      </div>
    </div>

    <div class="mt-6">
      <p class="mb-2 text-sm text-on-surface-variant">mode="alternate"</p>
      <Timeline
        mode="alternate"
        items={[
          { content: '第一步：需求确认' },
          { content: '第二步：方案设计', color: 'green' },
          { content: '第三步：开发实现' },
          { content: '第四步：测试验收', color: 'gray' },
        ]}
      />
    </div>

    <Divider />

    <h3 class="mb-3 text-lg font-semibold">横向布局</h3>
    <div class="space-y-8">
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">orientation="horizontal" · mode="start"</p>
        <Timeline orientation="horizontal" items={titleItems} />
      </div>
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">orientation="horizontal" · mode="end"</p>
        <Timeline orientation="horizontal" mode="end" items={titleItems} />
      </div>
      <div>
        <p class="mb-2 text-sm text-on-surface-variant">orientation="horizontal" · mode="alternate"</p>
        <Timeline
          orientation="horizontal"
          mode="alternate"
          items={[
            { title: '需求', content: '确认范围' },
            { title: '设计', content: '输出方案', color: 'green' },
            { title: '开发', content: '完成实现' },
            { title: '上线', content: '发布验收', color: 'red' },
          ]}
        />
      </div>
    </div>

    <Divider />

    <h3 class="mb-3 text-lg font-semibold">反转顺序</h3>
    <Timeline reverse items={baseItems} />
  </div>
)

export default TimelinePage
