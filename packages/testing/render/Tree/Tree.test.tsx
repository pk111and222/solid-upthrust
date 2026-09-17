import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { expect,it,vi } from 'vitest'
import Tree from '../../../components/lib/Tree/index'
it('routes native row drops with the position and prevents disabled drags',()=>{
 const host=document.createElement('div');document.body.append(host);const onDrop=vi.fn()
 const dispose=render(()=><Tree draggable treeData={[{value:'a',label:'A'},{value:'b',label:'B'},{value:'c',label:'C',disabled:true}]} onDrop={onDrop} />,host);flush()
 const rows=host.querySelectorAll('[role="treeitem"] > div')
 expect(rows[2].getAttribute('draggable')).toBe('false')
 rows[0].dispatchEvent(new DragEvent('dragstart',{bubbles:true}));flush();rows[1].dispatchEvent(new DragEvent('drop',{bubbles:true}));flush()
 expect(onDrop).toHaveBeenCalledOnce();expect(onDrop.mock.calls[0][0]).toMatchObject({dragNode:{value:'a'},node:{value:'b'},dropPosition:0,dropToGap:false})
 dispose();host.remove()
})
