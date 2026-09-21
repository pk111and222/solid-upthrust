import Switch from 'upthrust-ui/source/Switch'
export default function Sizes() {
 return <div class="flex flex-col items-start gap-4">
  <div class="flex items-center gap-3"><label for="switch-small">小号</label><Switch id="switch-small" size="small" defaultChecked checkedChildren="开" unCheckedChildren="关"/></div>
  <div class="flex items-center gap-3"><label for="switch-middle">中号</label><Switch id="switch-middle" defaultChecked checkedChildren="开启" unCheckedChildren="关闭"/></div>
  <div class="flex items-center gap-3"><label for="switch-large">large 映射中号</label><Switch id="switch-large" size="large" defaultChecked/></div>
  <div class="flex items-center gap-3" dir="rtl"><label for="switch-rtl">从右向左</label><Switch id="switch-rtl" size="small" defaultChecked checkedChildren="开" unCheckedChildren="关"/></div>
 </div>
}
