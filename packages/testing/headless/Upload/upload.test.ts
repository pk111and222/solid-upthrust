import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createUpload, type UploadFile, type UploadRequest } from '../../../competence/src/upload'

const step = (fn: () => void) => { fn(); flush() }

const mkFile = (name: string, size = 1024, type = 'image/png'): File =>
  new File([new Uint8Array(size)], name, { type })

/**
 * A scripted fake transport: capture the handlers, let the test drive
 * progress/success/error manually (mirrors how the real XHR fires them).
 */
const scriptedRequest = () => {
  const calls: { file: UploadFile; handlers: Parameters<UploadRequest>[1] }[] = []
  const aborts = vi.fn()
  const request: UploadRequest = (file, handlers) => {
    calls.push({ file, handlers })
    return { abort: aborts }
  }
  return { request, calls, aborts }
}

describe('createUpload — add pipeline', () => {
  it('adds picked files with generated uid and uploading status, then auto-posts', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, onChange })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      const list = ins.fileList()
      expect(list).toHaveLength(1)
      expect(list[0].name).toBe('a.png')
      expect(list[0].status).toBe('uploading')
      expect(typeof list[0].uid).toBe('string')
      expect(calls).toHaveLength(1)
      // Two onChange events: the ADD (status uploading) and the request's
      // PATCH (status uploading re-commit before the transport starts).
      expect(onChange.mock.calls[0][0].fileList).toHaveLength(1)
      expect(onChange.mock.calls.at(-1)![0].fileList).toHaveLength(1)
    })
  })

  it('beforeUpload returning false drops the file before it enters the list', () => {
    createRoot(() => {
      const beforeUpload = vi.fn(() => false)
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, beforeUpload })
      step(() => ins.addFiles([mkFile('big.png')], 'select'))
      expect(ins.fileList()).toHaveLength(0)
      expect(calls).toHaveLength(0)
      expect(beforeUpload).toHaveBeenCalledOnce()
    })
  })

  it('beforeUpload promise awaited: resolves true → added, false → dropped', async () => {
    await createRoot(async () => {
      const { request, calls } = scriptedRequest()
      const ins = createUpload({
        request,
        beforeUpload: (f) => f.name === 'ok.png' ? Promise.resolve(true) : Promise.resolve(false),
      })
      ins.addFiles([mkFile('ok.png'), mkFile('no.png')], 'select')
      await Promise.resolve()
      flush()
      expect(ins.fileList().map(f => f.name)).toEqual(['ok.png'])
      expect(calls).toHaveLength(1)
    })
  })

  it('maxCount > 1 trims the OLDEST overflow', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      const ins = createUpload({ request, maxCount: 2 })
      step(() => ins.addFiles([mkFile('1.png'), mkFile('2.png'), mkFile('3.png')], 'select'))
      expect(ins.fileList().map(f => f.name)).toEqual(['2.png', '3.png'])
    })
  })

  it('maxCount === 1 replaces the whole list', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      const ins = createUpload({ request, maxCount: 1 })
      step(() => ins.addFiles([mkFile('1.png')], 'select'))
      step(() => ins.addFiles([mkFile('2.png')], 'select'))
      expect(ins.fileList().map(f => f.name)).toEqual(['2.png'])
    })
  })

  it('autoUpload false defers the request until post()', () => {
    createRoot(() => {
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, autoUpload: false })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      expect(calls).toHaveLength(0)
      step(() => ins.post())
      expect(calls).toHaveLength(1)
    })
  })

  it('two adds in one batch do not lose either (functional commit)', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      const ins = createUpload({ request })
      ins.addFiles([mkFile('a.png')], 'select')
      ins.addFiles([mkFile('b.png')], 'select')
      flush()
      expect(ins.fileList().map(f => f.name)).toEqual(['a.png', 'b.png'])
    })
  })

  it('disabled machine ignores picks', () => {
    createRoot(() => {
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, disabled: true })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      expect(ins.fileList()).toHaveLength(0)
      expect(calls).toHaveLength(0)
    })
  })
})

describe('createUpload — request lifecycle', () => {
  it('progress updates percent and fires onProgress', () => {
    createRoot(() => {
      const onProgress = vi.fn()
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, onProgress })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      step(() => calls[0].handlers.onProgress({ percent: 42 }))
      expect(ins.fileList()[0].percent).toBe(42)
      expect(onProgress.mock.calls[0][0].percent).toBe(42)
    })
  })

  it('success marks done with the response body', () => {
    createRoot(() => {
      const onSuccess = vi.fn()
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, onSuccess })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      step(() => calls[0].handlers.onSuccess({ url: 'https://cdn/x.png' }))
      const f = ins.fileList()[0]
      expect(f.status).toBe('done')
      expect(f.percent).toBe(100)
      expect(f.response).toEqual({ url: 'https://cdn/x.png' })
      expect(onSuccess).toHaveBeenCalledOnce()
    })
  })

  it('error marks the file error with the payload', () => {
    createRoot(() => {
      const onError = vi.fn()
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, onError })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      step(() => calls[0].handlers.onError('boom'))
      const f = ins.fileList()[0]
      expect(f.status).toBe('error')
      expect(f.error).toBe('boom')
      expect(onError).toHaveBeenCalledOnce()
    })
  })

  it('abort cancels via the handle and rejects later progress', () => {
    createRoot(() => {
      const { request, calls, aborts } = scriptedRequest()
      const ins = createUpload({ request })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      step(() => ins.abort())
      expect(aborts).toHaveBeenCalledOnce()
      // Late progress from a zombie request must not resurrect percent.
      step(() => calls[0].handlers.onProgress({ percent: 90 }))
      expect(ins.fileList()[0].percent).toBe(0)
    })
  })

  it('post skips already-done files; retry only re-posts the failed one', () => {
    createRoot(() => {
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request })
      step(() => ins.addFiles([mkFile('a.png'), mkFile('b.png')], 'select'))
      step(() => calls[0].handlers.onSuccess('ok'))
      step(() => calls[1].handlers.onError('bad'))
      step(() => ins.post())
      // Only the errored file re-posts.
      expect(calls).toHaveLength(3)
      expect(calls[2].file.name).toBe('b.png')
    })
  })

  it('removed mid-flight: late success is ignored', () => {
    createRoot(() => {
      const onSuccess = vi.fn()
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request, onSuccess })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      const uid = ins.fileList()[0].uid
      step(() => ins.remove(uid))
      step(() => calls[0].handlers.onSuccess('late'))
      expect(ins.fileList()).toHaveLength(0)
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })
})

describe('createUpload — remove / clear', () => {
  it('remove deletes the row and fires onRemove with the removed file', () => {
    createRoot(() => {
      const onRemove = vi.fn()
      const { request } = scriptedRequest()
      const ins = createUpload({ request, onRemove })
      step(() => ins.addFiles([mkFile('a.png'), mkFile('b.png')], 'select'))
      const uid = ins.fileList()[0].uid
      step(() => ins.remove(uid))
      expect(ins.fileList().map(f => f.name)).toEqual(['b.png'])
      expect(onRemove).toHaveBeenCalledOnce()
      expect(onRemove.mock.calls[0][0].name).toBe('a.png')
    })
  })

  it('beforeRemove false cancels the removal', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      const ins = createUpload({ request, beforeRemove: () => false })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      const uid = ins.fileList()[0].uid
      step(() => ins.remove(uid))
      expect(ins.fileList()).toHaveLength(1)
    })
  })

  it('clear empties everything', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      const ins = createUpload({ request })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      step(() => ins.clear())
      expect(ins.fileList()).toHaveLength(0)
    })
  })
})

describe('createUpload — controlled value', () => {
  it('controlled value wins over the internal mirror', () => {
    createRoot(() => {
      const { request, calls } = scriptedRequest()
      const seeded: UploadFile[] = [
        { uid: 'u1', name: 'server.png', status: 'done', percent: 100 },
      ]
      const ins = createUpload({ request, value: seeded })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      // Parent never wrote back → the controlled list stays authoritative.
      expect(ins.fileList().map(f => f.name)).toEqual(['server.png'])
      expect(calls).toHaveLength(1) // but the request DID start
    })
  })

  it('onChange reports the WOULD-BE next list (round-trips value = fileList)', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      let value: UploadFile[] | undefined
      const ins = createUpload({
        request,
        get value() { return value },
        onChange: (info) => { value = info.fileList },
      })
      step(() => ins.setFileList([]))
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      expect(value).toHaveLength(1)
      expect(ins.fileList().map(f => f.name)).toEqual(['a.png'])
    })
  })

  it('defaultValue seeds the uncontrolled mirror', () => {
    createRoot(() => {
      const { request } = scriptedRequest()
      const ins = createUpload({
        request,
        defaultValue: [{ uid: 'u1', name: 'old.png', status: 'done' }],
      })
      expect(ins.fileList().map(f => f.name)).toEqual(['old.png'])
    })
  })
})

describe('createUpload — derived state', () => {
  it('percentOf / isUploading / preview / dragOver', () => {
    createRoot(() => {
      const { request, calls } = scriptedRequest()
      const ins = createUpload({ request })
      step(() => ins.addFiles([mkFile('a.png')], 'select'))
      const uid = ins.fileList()[0].uid
      step(() => calls[0].handlers.onProgress({ percent: 55 }))
      expect(ins.percentOf(uid)).toBe(55)
      expect(ins.isUploading()).toBe(true)
      step(() => calls[0].handlers.onSuccess('ok'))
      expect(ins.isUploading()).toBe(false)

      step(() => ins.setPreviewUid(uid))
      expect(ins.previewUid()).toBe(uid)
      step(() => ins.setPreviewUid(undefined))
      expect(ins.previewUid()).toBeUndefined()

      expect(ins.isDragOver()).toBe(false)
      step(() => ins.notifyDragOver(true))
      expect(ins.isDragOver()).toBe(true)
    })
  })
})

describe('Upload preprocessing for image cropping', () => {
  it('replaces the actual transport file with the returned Blob', () => createRoot(() => {
    const request = vi.fn(() => ({ abort() {} }))
    const cropped = new Blob(['cropped'], {type:'image/png'})
    const ins = createUpload({ request, beforeUpload: () => cropped })
    step(() => ins.addFiles([mkFile('original.png')], 'select'))
    const sent = request.mock.calls[0] as unknown as [import('../../../competence/src/upload').UploadFile]
    expect(sent[0].raw?.size).toBe(cropped.size)
    expect(sent[0].raw?.name).toBe('original.png'); expect(sent[0].type).toBe('image/png')
  }))
  it('preserves selection order when asynchronous crops resolve out of order', async () => {
    await createRoot(async () => {
      let first!: (file: File) => void
      const ins = createUpload({ autoUpload:false, beforeUpload: file => file.name === 'first.png' ? new Promise<File>(resolve => { first=resolve }) : Promise.resolve(new File(['second'],'second.png',{type:'image/png'})) })
      ins.addFiles([mkFile('first.png'),mkFile('second.png')],'select')
      await Promise.resolve(); flush(); expect(ins.fileList()).toHaveLength(0)
      first(new File(['first'],'first.png',{type:'image/png'})); await Promise.resolve(); flush()
      expect(ins.fileList().map(file=>file.name)).toEqual(['first.png','second.png'])
    })
  })
})
