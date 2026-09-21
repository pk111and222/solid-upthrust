import { afterEach, expect, it } from 'vitest'
import Switch, { type SwitchProps } from '../../../components/lib/Switch'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exported:typeof Public.Switch=Switch
const props:SwitchProps={defaultChecked:true}
let dispose=()=>{}
afterEach(()=>dispose())
// 公开组件/类型真实挂载，ref 返回 button，卸载无宿主残留。
it('[switch.exports.mount] public export ref and cleanup',()=>{
 let ref:HTMLButtonElement|undefined
 const view=mount(()=><Switch {...props} ref={el=>{ref=el}}/>);dispose=view.dispose
 expect(exported).toBe(Switch);expect(ref).toBe(view.host.querySelector('button'));expect(ref?.getAttribute('aria-checked')).toBe('true')
 view.dispose();dispose=()=>{};expect(view.host.isConnected).toBe(false)
})
