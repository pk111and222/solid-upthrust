import Tree from 'upthrust-ui/source/Tree'
import { nodes } from './data'
import { createSignal } from 'solid-js'
export default function Search() {
  const [query,setQuery]=createSignal('')
  return <Tree treeData={nodes} showSearch searchValue={query()} onSearch={setQuery} searchPlaceholder="查找项目节点" notFoundContent="没有匹配节点" />
}
