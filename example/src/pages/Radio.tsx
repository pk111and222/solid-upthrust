import Basic from '../../../docs/src/examples/radio/basic'
import Group from '../../../docs/src/examples/radio/group'
import Controlled from '../../../docs/src/examples/radio/controlled'
import Dynamic from '../../../docs/src/examples/radio/dynamic'
import Buttons from '../../../docs/src/examples/radio/buttons'
import CustomButtons from '../../../docs/src/examples/radio/custom-buttons'
import Context from '../../../docs/src/examples/radio/context'
export default function RadioPage() {
 return <div class="p-6 max-w-4xl space-y-6">
  <h2 class="text-2xl font-bold">Radio 单选框</h2>
  <section data-radio-demo="basic"><h3>基础状态与 ref</h3><Basic /></section>
  <section data-radio-demo="group"><h3>单选组与键盘</h3><Group /></section>
  <section data-radio-demo="controlled"><h3>父层确认后更新</h3><Controlled /></section>
  <section data-radio-demo="dynamic"><h3>动态禁用、外观与 skipGroup</h3><Dynamic /></section>
  <section data-radio-demo="buttons"><h3>按钮选项</h3><Buttons /></section>
  <section data-radio-demo="custom-buttons"><h3>RadioButton 自定义子项</h3><CustomButtons /></section>
  <section data-radio-demo="context"><h3>Form 与全局配置</h3><Context /></section>
 </div>
}
