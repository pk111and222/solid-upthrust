import { createSignal, flush } from 'solid-js'
import { expect, it } from 'vitest'
import Button, { type ButtonIns } from '../../../components/lib/Button'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { mount } from '../../utils/mount'
// 默认导入可挂载，Provider 动态配置与显式覆盖生效，卸载释放实例。
it('[button.mount.provider] mounts and follows provider defaults', () => {
  const [disabled,setDisabled]=createSignal(false,{ownedWrite:true}); let ref!:ButtonIns
  const view=mount(() => <ConfigProvider componentSize="large" componentDisabled={disabled()}><Button ref={v=>ref=v}>继承</Button><Button disabled={false} size="small">覆盖</Button></ConfigProvider>)
  try {
    const [first,second]=view.host.querySelectorAll('button')
    expect(first.textContent).toBe('继承'); expect(first.classList.contains('h-control-lg')).toBe(true)
    expect(ref.buttonEle()).toBe(first); setDisabled(true); flush(); expect(first.disabled).toBe(true); expect(second.disabled).toBe(false)
    expect(second.classList.contains('h-control-sm')).toBe(true)
  } finally {view.dispose()}
  expect(ref.buttonEle()).toBeUndefined()
})
