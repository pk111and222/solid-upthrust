import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { createSkeleton, skeletonBlocks } from '../../../competence/src/skeleton'
let dispose=()=>{}
afterEach(()=>dispose())
// 默认配置和显式 true 都输出一个全宽标题与三行全宽段落。
it.each([{}, {title:true,paragraph:true}])('[skeleton.blocks.default] %j',config=>{
  expect(skeletonBlocks(config)).toEqual([{kind:'title',width:undefined},...Array.from({length:3},()=>({kind:'paragraph',width:undefined}))])
})
// 标题和段落四种开关组合独立决定节点数量。
it.each([true,false].flatMap(title=>[true,false].map(paragraph=>({title,paragraph}))))('[skeleton.blocks.composition] $title / $paragraph',config=>{
  const blocks=skeletonBlocks(config)
  expect(blocks.filter(b=>b.kind==='title')).toHaveLength(config.title?1:0)
  expect(blocks.filter(b=>b.kind==='paragraph')).toHaveLength(config.paragraph?3:0)
})
// 单个宽度应用于每行，数字零、CSS 百分比和 calc 都应保留。
it.each([0,120,'50%','calc(100% - 20px)'])('[skeleton.blocks.width] %s',width=>{
  expect(skeletonBlocks({title:{width},paragraph:{rows:2,width}})).toEqual([{kind:'title',width},{kind:'paragraph',width},{kind:'paragraph',width}])
})
// 宽度数组缺项回退为全宽，多余项忽略，零宽度不能被默认值覆盖。
it('[skeleton.blocks.width-array] handles short and long arrays',()=>{
  expect(skeletonBlocks({title:false,paragraph:{rows:3,width:[0,'40%']}}).map(b=>b.width)).toEqual([0,'40%',undefined])
  expect(skeletonBlocks({title:false,paragraph:{rows:1,width:[20,40]}}).map(b=>b.width)).toEqual([20])
})
// 行数向下取整，负数与非有限数按零行处理，避免无穷循环。
it.each([[0,0],[-1,0],[2.9,2],[NaN,0],[Infinity,0],[-Infinity,0]])('[skeleton.blocks.rows] %s', (rows,count)=>{
  expect(skeletonBlocks({title:false,paragraph:{rows}})).toHaveLength(count)
})
// loading 和内容配置响应式更新，实例 getter 与公开状态保持一致。
it('[skeleton.controlled] updates loading and composition',()=>{
  const [loading,setLoading]=createSignal<boolean|undefined>(undefined,{ownedWrite:true})
  const [rows,setRows]=createSignal(2,{ownedWrite:true})
  const sk=createRoot(cleanup=>{dispose=cleanup;return createSkeleton({get loading(){return loading()},get paragraph(){return {rows:rows()}}})})
  expect(sk.loading()).toBe(true);expect(sk.refs.loading()).toBe(true);expect(sk.blocks()).toHaveLength(3)
  setLoading(false);setRows(0);flush();expect(sk.loading()).toBe(false);expect(sk.blocks()).toHaveLength(1)
  setLoading(undefined);setRows(4);flush();expect(sk.refs.loading()).toBe(true);expect(sk.blocks()).toHaveLength(5)
})
