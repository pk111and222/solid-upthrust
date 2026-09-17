import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Upload from '../../../components/lib/Upload/index'
let dispose:(()=>void)|undefined
const mount=(view:Parameters<typeof render>[0])=>{const host=document.createElement('div');document.body.append(host);dispose=render(view,host);flush();return host}
afterEach(()=>{dispose?.();flush();document.body.innerHTML=''})
const files=[{uid:'one',name:'one.png',url:'/one.png',type:'image/png',status:'done' as const},{uid:'two',name:'two.png',url:'/two.png',type:'image/png',status:'done' as const}]
describe('Upload list customization',()=>{
  it('supports showUploadList=false independently from the old showList flag',()=>{
    const host=mount(()=><Upload defaultValue={files} showUploadList={false} />)
    expect(host.textContent).not.toContain('one.png')
  })
  it('customizes actions per file and renders additional metadata',()=>{
    const onDownload=vi.fn()
    const host=mount(()=><Upload defaultValue={files} showUploadList={{showRemoveIcon:file=>file.uid==='two',showDownloadIcon:true,extra:file=><span>{file.uid}-extra</span>}} onDownload={onDownload} />)
    expect(host.querySelectorAll('[aria-label="移除"]')).toHaveLength(1)
    expect(host.querySelectorAll('[aria-label="下载"]')).toHaveLength(2)
    ;(host.querySelector('[aria-label="下载"]') as HTMLButtonElement).click(); expect(onDownload).toHaveBeenCalledWith(files[0]); expect(host.textContent).toContain('one-extra')
  })
  it('passes working actions to itemRender and respects removal veto',()=>{
    const beforeRemove=vi.fn(()=>false)
    const host=mount(()=><Upload defaultValue={files.slice(0,1)} beforeRemove={beforeRemove} itemRender={(origin,file,_list,actions)=><div>{origin}<button onClick={actions.remove}>Custom remove {file.name}</button></div>} />)
    ;[...host.querySelectorAll('button')].find(el=>el.textContent?.startsWith('Custom remove'))!.click(); flush()
    expect(beforeRemove).toHaveBeenCalledOnce(); expect(host.textContent).toContain('one.png')
  })
  it('hides picture-card preview and remove actions when requested',()=>{
    const onPreview=vi.fn()
    const host=mount(()=><Upload listType="picture-card" defaultValue={files} showUploadList={{showPreviewIcon:false,showRemoveIcon:false}} onPreview={onPreview} />)
    expect(host.querySelector('[aria-label="预览"]')).toBeNull();expect(host.querySelector('[aria-label="移除"]')).toBeNull()
    host.querySelector('img')!.click();expect(onPreview).not.toHaveBeenCalled()
  })
})
