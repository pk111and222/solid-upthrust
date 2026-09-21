import Basic from '../../../docs/src/examples/checkbox/basic'
import Controlled from '../../../docs/src/examples/checkbox/controlled'
import Confirmation from '../../../docs/src/examples/checkbox/confirmation'
import Group from '../../../docs/src/examples/checkbox/group'
import Children from '../../../docs/src/examples/checkbox/children'
import Context from '../../../docs/src/examples/checkbox/context'
export default function CheckboxPage() {
 return <div class="p-6 max-w-4xl space-y-6">
  <h2 class="text-2xl font-bold">Checkbox 多选框</h2>
  <section data-checkbox-demo="basic"><h3>基础状态</h3><Basic /></section>
  <section data-checkbox-demo="controlled"><h3>受控与原生 ref</h3><Controlled /></section>
  <section data-checkbox-demo="confirmation"><h3>父层确认后更新</h3><Confirmation /></section>
  <section data-checkbox-demo="group"><h3>CheckboxGroup 全选与半选</h3><Group /></section>
  <section data-checkbox-demo="children"><h3>自定义子项</h3><Children /></section>
  <section data-checkbox-demo="context"><h3>Form 与全局配置</h3><Context /></section>
 </div>
}
