import { createRoot, createSignal, flush, merge } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createTypography, type TypographyConfig, type TypographyEditableConfig } from '../../../competence/src/typography'
let dispose = () => {}
const setup = (config: Partial<TypographyConfig> = {}) => createRoot(d => { dispose = d; return createTypography(merge({ text: () => 'initial', writeClipboard: vi.fn().mockResolvedValue(undefined) }, config)) })
afterEach(() => { dispose(); vi.useRealTimers() })
// 非受控保存、长度限制和取消时的事件顺序。
it('[typography.edit.uncontrolled] commits trimmed draft and cancels separately', () => {
  const events: string[] = []
  const state = setup({ editable: { maxLength: 3, onStart: () => events.push('start'), onChange: t => events.push(t), onEnd: () => events.push('end'), onCancel: () => events.push('cancel') } })
  state.startEdit(); flush(); expect(state.draft()).toBe('initial')
  state.setDraft('abcdef'); flush(); state.finishEdit(); flush(); expect(state.text()).toBe('abc')
  state.startEdit(); flush(); state.setDraft('discard'); state.cancelEdit(); flush()
  expect(state.text()).toBe('abc'); expect(state.editing()).toBe(false)
  expect(events).toEqual(['start', 'abc', 'end', 'start', 'cancel'])
})
// 受控文字和开关只能请求变更，父层更新后才显示新值。
it('[typography.edit.controlled] awaits owner values and avoids duplicate blur commits', () => {
  const change = vi.fn(), end = vi.fn()
  const [config, setConfig] = createSignal<TypographyEditableConfig>({ text: 'owner', editing: true, onChange: change, onEnd: end }, { ownedWrite: true })
  const state = setup({ get editable() { return config() } }); flush()
  expect(state.draft()).toBe('owner')
  state.finishEdit('new'); state.finishEdit('new'); flush()
  expect(state.text()).toBe('owner'); expect(state.editing()).toBe(true)
  expect(change).toHaveBeenCalledTimes(1); expect(end).toHaveBeenCalledTimes(1)
  setConfig({ text: 'new', editing: false }); flush(); expect(state.text()).toBe('new'); expect(state.editing()).toBe(false)
})
// maxLength=0 有明确语义，禁用后所有命令均不执行。
it('[typography.disabled] prevents all actions and supports zero length', async () => {
  const writeClipboard = vi.fn(), change = vi.fn()
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  const state = setup({ get disabled() { return disabled() }, editable: { maxLength: 0, onChange: change }, copyable: true, writeClipboard })
  state.startEdit(); await state.copy(); flush(); expect(state.editing()).toBe(false); expect(writeClipboard).not.toHaveBeenCalled()
  setDisabled(false); flush(); state.startEdit(); flush(); state.finishEdit('abc'); flush(); expect(state.text()).toBe(''); expect(change).toHaveBeenCalledWith('')
})
// 复制异步文案期间不重复写入，成功状态两秒后复位。
it('[typography.copy.async] prevents duplicate writes and resets feedback', async () => {
  vi.useFakeTimers(); let resolve!: (s: string) => void
  const writeClipboard = vi.fn().mockResolvedValue(undefined), onCopy = vi.fn()
  const state = setup({ copyable: { text: () => new Promise<string>(r => resolve = r), onCopy }, writeClipboard })
  const pending = state.copy(); await state.copy(); expect(state.copying()).toBe(true)
  resolve('resolved'); await pending; expect(writeClipboard).toHaveBeenCalledExactlyOnceWith('resolved'); expect(onCopy).toHaveBeenCalledWith('resolved')
  expect(state.copied()).toBe(true); vi.advanceTimersByTime(2000); flush(); expect(state.copied()).toBe(false)
})
// 获取文案和写剪贴板两类失败均走错误回调，之后允许重试。
it.each(['source', 'write'])('[typography.copy.failure] handles %s failures', async kind => {
  const error = new Error('denied'), onError = vi.fn()
  const state = setup({ copyable: { text: kind === 'source' ? () => Promise.reject(error) : '', onError }, writeClipboard: kind === 'write' ? () => Promise.reject(error) : vi.fn() })
  await state.copy(); expect(onError).toHaveBeenCalledWith(error); expect(state.copied()).toBe(false); expect(state.copying()).toBe(false)
  await state.copy(); expect(onError).toHaveBeenCalledTimes(2)
})
// 卸载后才完成的文案不能写剪贴板，也不能触发成功/错误回调。
it('[typography.copy.dispose] cancels work before clipboard write after disposal', async () => {
  let resolve!: (s: string) => void
  const writeClipboard = vi.fn(), onCopy = vi.fn()
  const state = setup({ copyable: { text: () => new Promise<string>(r => resolve = r), onCopy }, writeClipboard })
  const pending = state.copy(); dispose(); resolve('late'); await pending
  expect(writeClipboard).not.toHaveBeenCalled(); expect(onCopy).not.toHaveBeenCalled()
})
// 已开始的浏览器写入无法撤销，但卸载后不更新状态或留下定时器。
it('[typography.copy.pending] ignores completion of an in-flight write', async () => {
  vi.useFakeTimers(); let resolve!: () => void
  const onCopy = vi.fn(), state = setup({ copyable: { onCopy }, writeClipboard: () => new Promise<void>(r => resolve = r) })
  const pending = state.copy(); dispose(); resolve(); await pending
  expect(onCopy).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0)
})
// 成功复制后卸载应取消反馈计时器。
it('[typography.copy.timer] clears feedback timer on disposal', async () => {
  vi.useFakeTimers(); const state = setup({ copyable: true }); await state.copy()
  expect(vi.getTimerCount()).toBe(1); dispose(); expect(vi.getTimerCount()).toBe(0)
})
// 成功回调可能同步卸载组件，不能在 cleanup 之后再创建泄漏的计时器。
it('[typography.copy.callbackDispose] clears timer when onCopy disposes owner', async () => {
  vi.useFakeTimers(); const state = setup({ copyable: { onCopy: () => dispose() } })
  await state.copy(); expect(vi.getTimerCount()).toBe(0)
})
// 第二次复制失败时不保留上一次的成功状态。
it('[typography.copy.retryFeedback] clears stale success before retry', async () => {
  const write = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'))
  const state = setup({ copyable: true, writeClipboard: write })
  await state.copy(); flush(); expect(state.copied()).toBe(true)
  await state.copy(); flush(); expect(state.copied()).toBe(false)
})
