import { afterEach, expect, it } from 'vitest'
import Input, { type InputProps } from '../../../components/lib/Input'
import InputPassword, { type PasswordProps } from '../../../components/lib/Input/Password'
import InputTextArea, { type TextAreaProps } from '../../../components/lib/Input/TextArea'
import InputSearch, { type SearchProps } from '../../../components/lib/Input/Search'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
const exportTypes: [typeof Public.Input, typeof Public.InputPassword, typeof Public.InputTextArea, typeof Public.InputSearch] = [Input,InputPassword,InputTextArea,InputSearch]
const props: [InputProps,PasswordProps,TextAreaProps,SearchProps] = [{defaultValue:'input'},{defaultValue:'password'},{defaultValue:'textarea'},{defaultValue:'search'}]
let dispose=()=>{}
afterEach(()=>dispose())
// 四个公开导出及类型可以独立挂载，ref 对应原生节点，卸载后无残留。
it('[input.exports.mount] four independent exports',()=>{
 const view=mount(()=><><Input {...props[0]} /><InputPassword {...props[1]} /><InputTextArea {...props[2]} /><InputSearch {...props[3]} /></>);dispose=view.dispose
 expect(exportTypes).toHaveLength(4);expect(view.host.querySelectorAll('input')).toHaveLength(3);expect(view.host.querySelector('textarea')?.value).toBe('textarea')
 view.dispose();dispose=()=>{};expect(view.host.isConnected).toBe(false)
})
