import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
import { createSignal } from 'solid-js'
export default function Editable() {
  const [selected,setSelected]=createSignal('无')
  let root:HTMLDivElement|undefined
  return <><Tree ref={el=>{root=el}} treeData={[{value:'edit',label:'编辑标题'}]} onSelect={keys=>setSelected(keys.join(',')||'无')}
    titleRender={()=> <input aria-label="编辑标题文本" class="border border-outline rounded h-[22px] px-1" value="自定义标题" />} />
    <output>选择：{selected()}</output><span hidden>{root?.tagName}</span></>
}
