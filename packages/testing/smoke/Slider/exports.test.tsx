import { afterEach, expect, it } from 'vitest'
import Slider, { type SliderProps, type SliderMark } from '../../../components/lib/Slider'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exported:typeof Public.Slider=Slider
const marks:SliderMark[]=[{value:0,label:'零'}]
const props:SliderProps={defaultValue:0,marks}
let dispose=()=>{}
afterEach(()=>dispose())
// 公开组件及类型实际挂载，ref 返回外框，卸载无宿主残留。
it('[slider.exports.mount] exports ref and cleanup',()=>{
 let ref:HTMLDivElement|undefined
 const view=mount(()=><Slider {...props} ref={el=>{ref=el}}/>);dispose=view.dispose
 expect(exported).toBe(Slider);expect(ref).toBe(view.host.firstElementChild);expect(view.host.querySelector('[role=slider]')?.getAttribute('aria-valuenow')).toBe('0')
 view.dispose();dispose=()=>{};expect(view.host.isConnected).toBe(false)
})
