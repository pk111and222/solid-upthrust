import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createSlider } from '../../../competence/src/slider'
const disposers: (() => void)[] = []
afterEach(() => disposers.splice(0).forEach(dispose => dispose()))
const owned = (fn: () => void) => createRoot(dispose => { disposers.push(dispose); fn() })
const act = (fn: () => void) => { fn(); flush() }
// 一次拖动位置只通知一次，结束不重复 change，after 报告最终值。
it('[slider.events] drag changes deduplicated', () => owned(() => {
 const change=vi.fn(), after=vi.fn(), ins=createSlider({defaultValue:20,onChange:change,onAfterChange:after})
 act(()=>ins.beginDrag(30));act(()=>ins.dragTo(40));act(()=>ins.endDrag())
 expect(change.mock.calls).toEqual([[30],[40]]);expect(after.mock.calls).toEqual([[40]])
 act(()=>ins.setValue(40));expect(change).toHaveBeenCalledTimes(2)
}))
// 非零 min 的单值写入不能错误地和无关 end 信号排序。
it('[slider.single] no hidden range endpoint', () => owned(() => {
 const change=vi.fn(),ins=createSlider({min:10,max:110,defaultValue:30,onChange:change})
 act(()=>ins.snapToMax(0));expect(ins.value()).toBe(110);expect(change).toHaveBeenLastCalledWith(110)
}))
// 范围 Home/End 保持当前滑块身份，不允许越过另一端。
it('[slider.range.bounds] home end and crossing', () => owned(() => {
 const change=vi.fn(),ins=createSlider({defaultRangeValue:[20,60],onRangeChange:change})
 act(()=>ins.snapToMax(0));expect(ins.rangeValue()).toEqual([60,60]);expect(change.mock.calls).toEqual([[[60,60]]])
 act(()=>ins.setRangeValue([20,60]));act(()=>ins.snapToMin(1));expect(ins.rangeValue()).toEqual([20,20])
}))
// marksOnly 用键盘跳到下一离散刻度，忽略越界和重复刻度。
it('[slider.marks.keyboard] discrete navigation and bounds', () => owned(() => {
 const ins=createSlider({defaultValue:25,marksOnly:true,marks:[{value:-5},{value:0},{value:25},{value:25},{value:60},{value:100},{value:120}]})
 act(()=>ins.stepHandle(0,1));expect(ins.value()).toBe(60);act(()=>ins.stepHandle(0,-1));expect(ins.value()).toBe(25)
 expect(ins.marks().map(mark=>mark.value)).toEqual([0,25,60,100]);expect(ins.valueAt(101)).toBe(100)
}))
// 小数步进没有二进制尾差，舍入不越界，零跨度无 NaN。
it('[slider.numeric] precision clamp and zero span', () => owned(() => {
 const ins=createSlider({min:0,max:1,step:0.1,defaultValue:0.2});act(()=>ins.stepHandle(0,1));expect(ins.value()).toBe(0.3)
 const edge=createSlider({max:10,step:6});expect(edge.valueAt(100)).toBe(10)
 const fixed=createSlider({min:5,max:5});expect(fixed.percentOf(5)).toBe(0);expect(fixed.valueAt(50)).toBe(5)
}))
// 拒绝受控意图不改变状态，结束只报告有效值，不再重发旧值的 change。
it('[slider.controlled] rejected and accepted updates', () => owned(() => {
 const [value,set]=createSignal(20,{ownedWrite:true}),change=vi.fn(),after=vi.fn(),ins=createSlider({get value(){return value()},onChange:change,onAfterChange:after})
 act(()=>ins.beginDrag(80));expect(ins.value()).toBe(20);act(()=>ins.endDrag());expect(change.mock.calls).toEqual([[80]]);expect(after).toHaveBeenCalledWith(20)
 act(()=>set(60));expect(ins.value()).toBe(60)
}))
// readonly 及动态 disabled 拦截全部写入，包括结束中的修正。
it('[slider.gates] readonly and disabling a drag', () => owned(() => {
 const [disabled,set]=createSignal(false,{ownedWrite:true}),change=vi.fn(),after=vi.fn(),ins=createSlider({get disabled(){return disabled()},onChange:change,onAfterChange:after})
 act(()=>ins.beginDrag(20));act(()=>set(true));act(()=>ins.dragTo(80));act(()=>ins.endDrag());expect(ins.value()).toBe(20);expect(change.mock.calls).toEqual([[20]]);expect(after).not.toHaveBeenCalled()
 const read=createSlider({readonly:true,defaultRangeValue:[20,60]});act(()=>read.beginDrag(90));act(()=>read.setRangeValue([0,100]));expect(read.rangeValue()).toEqual([20,60]);expect(read.isDragging()).toBe(false)
}))
// 无有效刻度退为连续值；异常步长回退 1，受控越界归一不主动通知。
it('[slider.numeric.fallback] empty marks invalid step and controlled bounds', () => owned(() => {
 const free=createSlider({marksOnly:true,marks:[{value:120}]});expect(free.valueAt(37.3)).toBeCloseTo(37.3)
 const invalid=createSlider({step:0,defaultValue:2});act(()=>invalid.stepHandle(0,1));expect(invalid.value()).toBe(3)
 const change=vi.fn(),controlled=createSlider({value:120,onChange:change});expect(controlled.value()).toBe(100);expect(controlled.percentOf(-10)).toBe(0);expect(change).not.toHaveBeenCalled()
}))
// 两端重叠时直接指定终点仍可向外拖动，取消不报告完成。
it('[slider.drag.explicit] overlapping handle identity and cancellation', () => owned(() => {
 const after=vi.fn(),ins=createSlider({defaultRangeValue:[50,50],onAfterChange:after})
 act(()=>ins.beginDrag(50,1));act(()=>ins.dragTo(70));expect(ins.rangeValue()).toEqual([50,70]);act(()=>ins.cancelDrag());act(()=>ins.dragTo(80));act(()=>ins.endDrag());expect(ins.rangeValue()).toEqual([50,70]);expect(after).not.toHaveBeenCalled()
}))
