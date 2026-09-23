import { createSignal, flush } from 'solid-js'
import { expect, it } from 'vitest'
import TreeSelect, { type TreeSelectNode, type TreeSelectProps } from '../../../components/lib/TreeSelect'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import type * as Public from '../../../components/lib'
import type { TreeSelectConfig, TreeSelectIns } from '../../../competence/src'
import { mount } from '../../utils/mount'

const exported: typeof Public.TreeSelect = TreeSelect
const nodes: TreeSelectNode[] = [{ value: 1, label: '一' }]
const config: TreeSelectConfig = { treeData: nodes }
const inspect = (_instance: TreeSelectIns) => {}
void config; void inspect

// 公开入口、类型、ref 与 Provider 禁用默认值在挂载和卸载后保持一致。
it('[tree-select.exports.provider] public mount follows provider defaults', () => {
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  let ref: HTMLDivElement | undefined
  const props: TreeSelectProps = { treeData: nodes, ref: el => { ref = el } }
  const view = mount(() => <ConfigProvider componentDisabled={disabled()}>
    <TreeSelect {...props} />
    <TreeSelect treeData={nodes} disabled={false} />
  </ConfigProvider>)
  try {
    expect(exported).toBe(TreeSelect)
    expect(ref).toBe(view.host.querySelector('[role="combobox"]'))
    expect(view.host.querySelectorAll('[role="combobox"]')[0].getAttribute('aria-disabled')).toBe('true')
    expect(view.host.querySelectorAll('[role="combobox"]')[1].getAttribute('aria-disabled')).toBe('false')
    setDisabled(false); flush()
    expect(view.host.querySelectorAll('[role="combobox"]')[0].getAttribute('aria-disabled')).toBe('false')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
