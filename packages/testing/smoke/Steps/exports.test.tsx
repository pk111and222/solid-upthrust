import { expect, it } from 'vitest'
import Steps, { type StepItem, type StepsClassNames, type StepsProps } from '../../../components/lib/Steps'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

const exported: typeof Public.Steps = Steps
const item: StepItem = { title: '一', content: '内容' }

// 公开出口：Steps 从包入口导出，公开类型可用于挂载，卸载后宿主移除。
it('[steps.exports] public types mount and clean up', () => {
  const classNames: StepsClassNames = { root: 'smoke-root' }
  const props: StepsProps = { items: [item, { title: '二' }], current: 1, classNames }
  const view = mount(() => <Steps {...props} />)
  try {
    expect(exported).toBe(Steps)
    expect(view.host.querySelector('.smoke-root')).not.toBeNull()
    expect(view.host.querySelectorAll('[data-step-status]')).toHaveLength(2)
    expect(view.host.querySelector('[aria-current="step"]')?.textContent).toContain('二')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
