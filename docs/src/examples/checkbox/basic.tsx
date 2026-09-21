import Checkbox from 'upthrust-ui/source/Checkbox'
export default function Basic() {
 return <div class="flex flex-wrap gap-4">
  <Checkbox>接受协议</Checkbox><Checkbox defaultChecked>默认选中</Checkbox>
  <Checkbox disabled>禁用未选</Checkbox><Checkbox disabled defaultChecked>禁用已选</Checkbox>
  <Checkbox indeterminate>半选</Checkbox><Checkbox disabled indeterminate>禁用半选</Checkbox>
 </div>
}
