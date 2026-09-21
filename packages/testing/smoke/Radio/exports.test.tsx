import { afterEach, expect, it } from 'vitest'
import Radio, { RadioGroup, RadioButton, type RadioProps, type RadioGroupProps, type RadioButtonProps, type RadioOption } from '../../../components/lib/Radio'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exports:[typeof Public.Radio,typeof Public.RadioGroup,typeof Public.RadioButton]=[Radio,RadioGroup,RadioButton]
const option:RadioOption={label:'选项',value:0}
const props:[RadioProps,RadioGroupProps,RadioButtonProps]=[{defaultChecked:true},{options:[option],defaultValue:0},{value:'button'}]
let dispose=()=>{}
afterEach(()=>dispose())
// 三个公开命名导出/类型可以独立挂载并销毁，ref 为原生 input。
it('[radio.exports.mount] public components and cleanup',()=>{
 let ref:HTMLInputElement|undefined
 const view=mount(()=><><Radio {...props[0]} ref={el=>{ref=el}}/><RadioGroup {...props[1]}/><RadioButton {...props[2]}>按钮</RadioButton></>);dispose=view.dispose
 expect(exports).toHaveLength(3);expect(view.host.querySelectorAll('input')).toHaveLength(3);expect(view.host.querySelectorAll('input:checked')).toHaveLength(2);expect(ref).toBe(view.host.querySelector('input'))
 view.dispose();dispose=()=>{};expect(view.host.isConnected).toBe(false)
})
