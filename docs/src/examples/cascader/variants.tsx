import Cascader from 'upthrust-ui/source/Cascader'
const options = [{ value: 'a', label: '一级', children: [{ value: 'b', label: '二级' }] }]
export default function Variants() { return <div class="flex flex-col gap-3 max-w-sm"><Cascader options={options} changeOnSelect placeholder="任意层级提交" /><Cascader options={options} expandTrigger="hover" placeholder="悬停展开" /><Cascader options={options} allowClear defaultValue={['a', 'b']} placeholder="选择后显示清除按钮" /><Cascader options={options} disabled defaultValue={['a', 'b']} placeholder="禁用" /></div> }
