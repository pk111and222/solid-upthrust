import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTree } from '../../../competence/src/tree'
import { moveTreeNode } from '../../../competence/src/treeDrag'
const nodes = [{value:'a',label:'A',children:[{value:'aa',label:'AA'}]},{value:'b',label:'B'},{value:'c',label:'C',disabled:true}]
describe('tree drag/drop', () => {
  it('blocks self, descendants and disabled rows', () => createRoot(() => {
    const tree = createTree({treeData:nodes,draggable:true})
    expect(tree.startDrag('c')).toBe(false); tree.startDrag('a')
    expect(tree.canDrop('a',0)).toBe(false); expect(tree.canDrop('aa',1)).toBe(false); expect(tree.canDrop('c',0)).toBe(false); expect(tree.canDrop('b',0)).toBe(true)
  }))
  it('honors allowDrop and emits complete metadata without mutating input', () => createRoot(() => {
    const onDrop = vi.fn()
    const tree = createTree({treeData:nodes,draggable:true,onDrop,allowDrop:info=>info.dropPosition!==0})
    tree.startDrag('a'); expect(tree.drop('b',0)).toBe(false)
    tree.startDrag('a'); tree.drop('b',1); flush()
    expect(onDrop.mock.calls[0][0]).toMatchObject({node:nodes[1],dragNode:nodes[0],dragNodesKeys:['a','aa'],dropPosition:1,dropToGap:true})
    expect(nodes.map(node=>node.value)).toEqual(['a','b','c']); expect(tree.draggingKey()).toBeUndefined()
  }))
  it('immutably moves before/inside/after and rejects cycles', () => {
    expect(moveTreeNode(nodes,'a','b',1).map(node=>node.value)).toEqual(['b','a','c'])
    expect(moveTreeNode(nodes,'b','a',0)[0].children?.map(node=>node.value)).toEqual(['aa','b'])
    expect(moveTreeNode(nodes,'b','a',-1).map(node=>node.value)).toEqual(['b','a','c'])
    expect(moveTreeNode(nodes,'a','aa',0)).toBe(nodes)
  })
})
