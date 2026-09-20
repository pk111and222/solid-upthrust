import type { TreeNode } from 'upthrust-ui/source/Tree'
export const nodes: TreeNode[] = [
  { value: 'p', label: '项目', children: [
    { value: 'a', label: '文档' }, { value: 'b', label: '源码' },
    { value: 'd', label: '归档', disabled: true, children: [{value:'old',label:'旧版本'}] },
  ] },
  { value: 'z', label: '其他' },
]
