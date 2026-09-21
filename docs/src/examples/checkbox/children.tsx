import Checkbox, { CheckboxGroup } from 'upthrust-ui/source/Checkbox'
export default function Children() {
 return <CheckboxGroup name="custom" defaultValue={[0]} class="p-2" style={{ 'border-radius': '4px' }}>
  <Checkbox value={0}>数字零</Checkbox><Checkbox value="0">字符串零</Checkbox>
  <Checkbox value="locked" disabled>锁定项</Checkbox>
  <Checkbox skipGroup name="independent" value="yes">独立开关</Checkbox>
 </CheckboxGroup>
}
