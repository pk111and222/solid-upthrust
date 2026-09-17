import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DatePicker from '../../../components/lib/DatePicker/index'
let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); dispose=render(view,host); flush(); return host }
afterEach(() => { dispose?.(); flush(); document.body.innerHTML='' })
describe('DatePicker extended UI',()=>{
  it('renders four quarters and reports the first date',()=>{
    const onChange=vi.fn()
    mount(()=><DatePicker open picker="quarter" defaultValue="2026-01-01" onChange={onChange} />)
    const options=document.querySelectorAll('[role="option"]'); expect(options).toHaveLength(4)
    ;(options[2] as HTMLElement).click(); flush(); expect(onChange).toHaveBeenCalledWith('2026-07-01')
  })
  it('renders and edits the time input without dropping the date',()=>{
    const onChange=vi.fn()
    mount(()=><DatePicker open showTime defaultValue="2026-09-15 12:30:00" onChange={onChange} />)
    const time=document.querySelector('input[type="time"]') as HTMLInputElement
    expect(time.value).toMatch(/^12:30(?::00)?$/); time.value='13:45:00'; time.dispatchEvent(new Event('input',{bubbles:true})); flush()
    expect(onChange).toHaveBeenCalledWith('2026-09-15 13:45:00')
  })
  it('evaluates a lazy range preset at click time and validates both ends',()=>{
    const lazy=vi.fn(()=>['2026-09-10','2026-09-20'] as [string,string]); const onChange=vi.fn()
    mount(()=><DatePicker.RangePicker open min="2026-09-01" presets={[{label:'Lazy range',value:lazy},{label:'Invalid',value:['2026-08-01','2026-09-20']}]} onChange={onChange} />)
    expect(lazy).not.toHaveBeenCalled()
    const button=[...document.querySelectorAll('button')].find(el=>el.textContent==='Lazy range')!
    button.click(); flush(); expect(lazy).toHaveBeenCalledOnce(); expect(onChange).toHaveBeenCalledWith(['2026-09-10','2026-09-20'])
    ;[...document.querySelectorAll('button')].find(el=>el.textContent==='Invalid')!.click(); flush(); expect(onChange).toHaveBeenCalledOnce()
  })
})
