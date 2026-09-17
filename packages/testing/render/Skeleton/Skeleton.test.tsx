import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { expect,it } from 'vitest'
import Skeleton,{SkeletonButton,SkeletonAvatar,SkeletonInput,SkeletonNode} from '../../../components/lib/Skeleton/index'
// 静态属性与具名子组件导出一致，组合挂载保持尺寸、动画和内容。
it('exports composable shapes with size, animation and block variants',()=>{
  expect(Skeleton.Button).toBe(SkeletonButton);expect(Skeleton.Avatar).toBe(SkeletonAvatar);expect(Skeleton.Input).toBe(SkeletonInput);expect(Skeleton.Node).toBe(SkeletonNode)
  const host=document.createElement('div');const dispose=render(()=><><Skeleton.Button active block/><Skeleton.Avatar size={48}/><Skeleton.Input size="small"/><Skeleton.Node>Chart</Skeleton.Node></>,host);flush()
  try { const parts=host.querySelectorAll('[aria-hidden="true"]');expect(parts).toHaveLength(4)
  expect((parts[0] as HTMLElement).style.width).toBe('100%');expect((parts[1] as HTMLElement).style.height).toBe('48px');expect((parts[2] as HTMLElement).style.height).toBe('24px');expect(parts[3].textContent).toBe('Chart');} finally { dispose(); flush() }
})
