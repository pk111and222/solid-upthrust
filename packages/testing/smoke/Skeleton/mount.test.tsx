import { createSignal, flush } from 'solid-js'
import { expect, expectTypeOf, it } from 'vitest'
import Skeleton,{SkeletonButton,SkeletonAvatar,SkeletonInput,SkeletonNode,type SkeletonIns} from '../../../components/lib/Skeleton'
import type {Skeleton as PublicSkeleton,SkeletonElementProps,SkeletonProps,SkeletonIns as PublicIns} from '../../../components/lib'
import { mount } from '../../utils/mount'
// 公共组件与实例/共用属性类型可以使用，静态属性与具名子组件对应。
it('[skeleton.exports] exposes component, parts and types',()=>{
  expectTypeOf<typeof PublicSkeleton>().toEqualTypeOf<typeof Skeleton>()
  expectTypeOf<PublicIns>().toEqualTypeOf<SkeletonIns>()
  expectTypeOf<SkeletonProps['active']>().toEqualTypeOf<SkeletonElementProps['active']>()
  expect([Skeleton.Button,Skeleton.Avatar,Skeleton.Input,Skeleton.Node]).toEqual([SkeletonButton,SkeletonAvatar,SkeletonInput,SkeletonNode])
})
// 最小挂载、更新、实例读取和卸载均验证可观察结果。
it('[skeleton.mount] mounts, updates and disposes',()=>{
  const [loading,setLoading]=createSignal(true,{ownedWrite:true});let ref!:SkeletonIns
  const v=mount(()=><Skeleton loading={loading()} ref={value=>ref=value}><p>已就绪</p></Skeleton>)
  try {expect(v.host.querySelector('[aria-hidden="true"]')).not.toBeNull();expect(ref.loading()).toBe(true);setLoading(false);flush();expect(v.host.textContent).toBe('已就绪');expect(ref.loading()).toBe(false)}finally{v.dispose()}
  expect(v.host.isConnected).toBe(false);expect(v.host.childElementCount).toBe(0)
})
