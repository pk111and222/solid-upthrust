import { type Component, createSignal } from 'solid-js'
import dayjs, { Dayjs } from 'dayjs'
import { Calendar, Divider, Typography, Badge } from 'upthrust-ui'
import { CALENDAR_ZH_CN, CALENDAR_EN_US } from 'upthrust-ui'
import type { CalendarPanelIns } from 'upthrust-competence'

const { Text } = Typography

// 通知事项 demo 的 mock 数据：某几格上有事项。
const eventCount = (date: Dayjs): number => {
  const key = date.format('YYYY-MM-DD')
  const table: Record<string, number> = {
    '2026-08-03': 2, '2026-08-08': 1, '2026-08-12': 3,
    '2026-08-16': 1, '2026-08-24': 2, '2026-08-31': 1,
  }
  return table[key] ?? 0
}

const getListData = (date: Dayjs): { type: string; content: string }[] => {
  const key = date.format('YYYY-MM-DD')
  const table: Record<string, { type: string; content: string }[]> = {
    '2026-08-03': [{ type: 'warning', content: '09:00 版本评审' }, { type: 'success', content: '14:00 组件对齐' }],
    '2026-08-08': [{ type: 'info', content: '10:00 周会' }],
    '2026-08-12': [{ type: 'error', content: '18:00 发布窗口' }],
  }
  return table[key] ?? []
}

// Headless 消费预览：直接驱动受控日历 —— 面板状态机全部来自
// createCalendarPanel（value/mode/事件路由）。
const HeadlessDemo: Component = () => {
  const [value, setValue] = createSignal(dayjs('2026-08-15'))
  const [mode, setMode] = createSignal<'month' | 'year'>('month')
  let ins: CalendarPanelIns | undefined

  return (
    <div>
      <Calendar
        ref={(i) => { ins = i }}
        value={value()}
        mode={mode()}
        onChange={setValue}
        onPanelChange={(_d, m) => setMode(m)}
      />
      <div class="mt-3 flex items-center gap-3">
        <button
          class="ut-control-sm rounded border border-outline px-2 hover:border-primary hover:text-primary"
          onClick={() => setValue(dayjs().add(1, 'month'))}
        >
          value + 1 月（受控）
        </button>
        <button
          class="ut-control-sm rounded border border-outline px-2 hover:border-primary hover:text-primary"
          onClick={() => setMode(mode() === 'month' ? 'year' : 'month')}
        >
          切换模式（当前 {mode() === 'month' ? '月' : '年'}）
        </button>
        <Text class="text-sm">
          面板锚点：{ins ? ins.pickerValue().format('YYYY-MM') : '—'}
        </Text>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        value/mode 双受控；pickerValue 跟随 value（未翻页时），全部语义由 headless 层定义。
      </p>
    </div>
  )
}

// 迷你年视图：defaultMode 非受控，点「月」切回日期网格。
const MiniYearDemo: Component = () => {
  return <Calendar fullscreen={false} defaultMode="year" defaultValue={dayjs('2026-08-15')} />
}

const CalendarPage: Component = () => {
  const [controlled, setControlled] = createSignal(dayjs('2026-08-15'))
  const [panelInfo, setPanelInfo] = createSignal('')

  return (
    <div class="p-6 max-w-5xl">
      <h2 class="text-2xl font-bold mb-4">Calendar 日历</h2>
      <p class="text-on-surface-variant mb-6">
        按照日历展示日期数据的基础物料（dayjs peer 依赖，antd API 对齐）。
      </p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <div class="max-w-[840px]">
        <Calendar
          onPanelChange={(date, mode) =>
            setPanelInfo(`${date.format('YYYY-MM-DD')} / ${mode === 'month' ? '月视图' : '年视图'}`)}
        />
        <p class="mt-2 text-sm text-on-surface-variant">
          最近一次面板事件：{panelInfo() || '—'}（onPanelChange）
        </p>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">迷你模式</h3>
      <div class="flex items-start gap-8">
        <div class="w-[320px]">
          <Calendar fullscreen={false} defaultValue={dayjs('2026-08-15')} />
        </div>
        <div class="w-[320px]">
          <MiniYearDemo />
        </div>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        左：月视图；右：年视图（非受控 defaultMode，可点击「月/年」互切）。
        迷你模式带整体圆角与边框，单元格 24px。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义单元格内容（cellRender）</h3>
      <div class="max-w-[840px]">
        <Calendar
          defaultValue={dayjs('2026-08-01')}
          cellRender={(date) => {
            const list = getListData(date)
            return (
              <ul class="mt-1 space-y-1">
                {list.map((item) => (
                  <li
                    class={`flex items-center gap-1 rounded-sm px-1 py-[1px] text-[12px] leading-[16px] ${
                      item.type === 'error'
                        ? 'bg-error/8 text-error'
                        : item.type === 'info'
                          ? 'bg-primary/8 text-primary'
                          : item.type === 'warning'
                            ? 'bg-[#faad14]/10 text-[#d48806]'
                            : 'bg-[#52c41a]/10 text-[#389e0d]'
                    }`}
                  >
                    {item.content}
                  </li>
                ))}
              </ul>
            )
          }}
        />
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        事项卡片按类型着色；类型色沿用库内非 token 色惯例（#faad14 / #52c41a）。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">通知事项（角标数量）</h3>
      <div class="max-w-[840px]">
        <Calendar
          defaultValue={dayjs('2026-08-01')}
          fullscreen={false}
          cellRender={(date) => (eventCount(date) > 0
            ? <Badge count={eventCount(date)} />
            : undefined)}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式 + validRange</h3>
      <div class="flex items-start gap-8">
        <div class="max-w-[840px] flex-1">
          <Calendar
            value={controlled()}
            onChange={setControlled}
            validRange={[dayjs('2026-08-05'), dayjs('2026-09-20')]}
          />
        </div>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        当前选中：<Text code>{controlled().format('YYYY-MM-DD')}</Text>；
        2026-08-05 ~ 2026-09-20 之外的格子全部禁用。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用日期（disabledDate）</h3>
      <div class="max-w-[840px]">
        <Calendar
          defaultValue={dayjs('2026-08-01')}
          disabledDate={(date) => date.day() === 0 || date.day() === 6}
          fullscreen={false}
        />
      </div>
      <p class="mt-2 text-on-surface-variant">周末整格禁用（周日与周六）。</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">周数列（showWeek）</h3>
      <div class="max-w-[840px]">
        <Calendar defaultValue={dayjs('2026-08-01')} showWeek />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义头部（headerRender）</h3>
      <div class="max-w-[840px]">
        <Calendar
          defaultValue={dayjs('2026-08-01')}
          headerRender={({ value, mode, onChange, onTypeChange }) => (
            <div class="flex items-center justify-between py-3">
              <span class="text-[16px] font-medium text-on-surface">
                {value.format('YYYY年MM月')} · {mode === 'month' ? '月' : '年'}视图
              </span>
              <div class="flex items-center gap-2">
                <button
                  class="ut-control-sm rounded border border-outline px-2 hover:border-primary hover:text-primary"
                  onClick={() => onChange(value.subtract(1, 'month'))}
                >
                  上月
                </button>
                <button
                  class="ut-control-sm rounded border border-outline px-2 hover:border-primary hover:text-primary"
                  onClick={() => onTypeChange(mode === 'month' ? 'year' : 'month')}
                >
                  切到{mode === 'month' ? '年' : '月'}视图
                </button>
              </div>
            </div>
          )}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">英文语言包（locale）</h3>
      <div class="max-w-[840px]">
        <Calendar locale={CALENDAR_EN_US} defaultValue={dayjs('2026-08-01')} fullscreen={false} />
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        默认中文（{CALENDAR_ZH_CN.shortWeekDays.join(' ')}），可整包替换为英文。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Headless 消费预览（createCalendarPanel）</h3>
      <div class="max-w-[840px]">
        <HeadlessDemo />
      </div>
    </div>
  )
}

export default CalendarPage
