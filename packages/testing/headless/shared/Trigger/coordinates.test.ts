import {createRoot,flush} from 'solid-js'
import {afterEach,expect,it,vi} from 'vitest'
import {createTrigger} from '../../../../competence/src/trigger'
let dispose=()=>{}
afterEach(()=>{dispose();vi.restoreAllMocks()})
// body 默认承载绝对定位，测量的视口坐标须补上页面横纵滚动量。
it('[trigger.coordinates.document] adds document scroll',()=>{
  vi.spyOn(window,'scrollX','get').mockReturnValue(30);vi.spyOn(window,'scrollY','get').mockReturnValue(240)
  const trigger=createRoot(d=>{dispose=d;return createTrigger({measure:()=>({top:120,left:80,placement:'bottomLeft'})})})
  trigger.triggerRef(document.createElement('button'));trigger.layerRef(document.createElement('div'));trigger.remeasure();flush()
  expect(trigger.layerStyle().top).toBe('360px');expect(trigger.layerStyle().left).toBe('110px')
})
// 相对容器的边框和内部滚动影响 absolute 原点，不能只减容器矩形。
it('[trigger.coordinates.containing-block] accounts for border and container scroll',()=>{
  const container=document.createElement('div'),layer=document.createElement('div')
  vi.spyOn(container,'getBoundingClientRect').mockReturnValue({top:50,left:20,width:300,height:200,right:320,bottom:250,x:20,y:50,toJSON:()=>({})})
  Object.defineProperties(container,{clientTop:{value:3},clientLeft:{value:5},scrollTop:{value:40},scrollLeft:{value:10}})
  Object.defineProperty(layer,'offsetParent',{value:container})
  const trigger=createRoot(d=>{dispose=d;return createTrigger({measure:()=>({top:120,left:80,placement:'bottomLeft'})})})
  trigger.triggerRef(document.createElement('button'));trigger.layerRef(layer);trigger.remeasure();flush()
  expect(trigger.layerStyle().top).toBe('107px');expect(trigger.layerStyle().left).toBe('65px')
})
