import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Upload — the rc-upload / antd Upload state core.
 *
 * ARCHITECTURE: Upload is a FILE QUEUE with an upload pipeline per file.
 * This layer owns:
 *  - the file list signal (controlled-mirror semantics, same as every
 *    form widget: controlled `value` wins when present, internal mirror
 *    otherwise; a `storeRef`-style synchronous mirror is NOT needed here
 *    because every mutation goes through one atomic functional commit —
 *    see commitList)
 *  - the add pipeline: beforeUpload gate → uid assignment → maxCount
 *    trimming / replace-first (maxCount === 1) → list commit → post
 *  - per-file XHR lifecycle (uploading → progress → success/error) via
 *    a REQUEST INJECTOR (`request`) so tests and consumers can swap the
 *    transport. The default is a plain XMLHttpRequest FormData POST with
 *    progress events.
 *  - abort (per-file / all), remove (with beforeUploadRemove gate),
 *    manual post (`autoUpload: false` defers posting), re-post retry
 *
 * Deliberately does NOT own: DOM, drag-and-drop geometry, the native
 * file-picker dialog. The UI layer feeds chosen File objects in via
 * addFiles(); both `<input type=file>` picks and DataTransfer drops
 * route through the same entry point.
 */

// ---- types ------------------------------------------------------------------

export type UploadFileStatus =
  | 'uploading' // in flight (or queued when autoUpload is off — antd renders the progress bar stalled)
  | 'done' // uploaded successfully
  | 'error' // failed (retryable)
  | 'removed' // deleted (transient: visible only in the onChange event)

/** The canonical item in the (controlled or internal) list. */
export type UploadFile = {
  /** Stable identity (antd's uid). Generated here; consumers may seed their own. */
  uid: string
  /** File name (display + fallback alt). */
  name: string
  /** MIME type. */
  type?: string
  /** Size in bytes. */
  size?: number
  /** Percent complete, 0-100. */
  percent?: number
  status?: UploadFileStatus
  /** Server response payload (echoed from the request's success result). */
  response?: unknown
  /** Error payload from the failed request, if any. */
  error?: unknown
  /** Object URL for preview rendering (browser-only; created by the UI layer). */
  url?: string
  /** The raw File handle (absent for server-seeded defaultValue items). */
  raw?: File
  [key: string]: unknown
}

export type UploadRequestProgress = {
  /** 0-100. */
  percent: number
}

export type UploadRequestResult = {
  status: 'success' | 'error'
  /** Server body stored on the file as `response` / `error`. */
  body?: unknown
}

/**
 * The transport contract. The default implementation is XHR-based; tests
 * inject fakes. An in-flight request can be canceled through `abort`.
 */
export type UploadRequest = (
  file: UploadFile,
  handlers: {
    onProgress: (p: UploadRequestProgress) => void
    onSuccess: (body?: unknown) => void
    onError: (err?: unknown) => void
  },
) => { abort: () => void }

export type UploadConfig = {
  /** Controlled list (the value channel). */
  value?: UploadFile[]
  defaultValue?: UploadFile[]
  /** Upload endpoint. Required for the default XHR request. */
  action?: string | ((file: UploadFile) => string)
  /** Additional fields appended to the FormData (or fn per file). */
  data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>)
  /** Request headers for the default XHR transport. */
  headers?: Record<string, string>
  /** Field name for the file part of the FormData. Default 'file'. */
  name?: string
  /** 'POST' etc. Default POST. */
  method?: string
  /** Transport override (tests / custom fetch adapters). */
  request?: UploadRequest
  /** Post immediately after add. Default true. */
  autoUpload?: boolean
  /** maxCount semantics: 1 replaces the list; >1 trims the OLDEST overflow. */
  maxCount?: number
  /** Show directory picker content (UI concern) but must accept folders. */
  directory?: boolean
  /** 'select' | 'drag' — reported to beforeUpload. */
  disabled?: boolean
  /** (file, fileList) => boolean | Promise<boolean>; false drops the file BEFORE it enters the list. */
  beforeUpload?: (
    file: UploadFile,
    fileList: UploadFile[],
  ) => boolean | Blob | Promise<boolean | Blob | undefined> | undefined
  /** Gate removal; false cancels. */
  beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void
  /** Fired on every status transition (antd onStatusChange — subset of onChange in practice). */
  onProgress?: (info: { file: UploadFile; fileList: UploadFile[]; percent: number }) => void
  onSuccess?: (file: UploadFile, fileList: UploadFile[]) => void
  onError?: (file: UploadFile, fileList: UploadFile[], error: unknown) => void
  onRemove?: (file: UploadFile) => void
  /** Called when the accept-check rejects a picked file (antd: onDrop). */
  onDropReject?: (files: File[]) => void
  /** Open state of the drag overlay (Dragger UI mirrors this). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: unknown[]
}

export type UploadIns = {
  /** The effective list (controlled wins). */
  fileList: () => UploadFile[]
  /** Set the whole list (controlled-value sync from the UI layer). */
  setFileList: (files: UploadFile[]) => void
  /** Entry point for both picker picks and drops. Runs the add pipeline. */
  addFiles: (files: File[] | FileList, source: 'select' | 'drag') => void
  /** Enqueue one already-modeled file (list seeding). */
  addFileItem: (file: UploadFile) => void
  /** Manually start upload (autoUpload false, retry after error). */
  post: (uid?: string) => void
  /** Cancel in-flight request(s). Without uid: all. */
  abort: (uid?: string) => void
  /** Remove from the list (gated by beforeRemove). */
  remove: (uid: string) => void
  /** Clear the whole list. */
  clear: () => void
  /** uid of the file being previewed (zoom modal — the UI layer renders it). */
  previewUid: () => string | undefined
  setPreviewUid: (uid: string | undefined) => void
  /** Drag overlay state (Dragger's dashed frame highlight). */
  isDragOver: () => boolean
  notifyDragOver: (over: boolean) => void
  isDisabled: () => boolean
  /** 0-100 for a single file, or null when nothing is uploading. */
  percentOf: (uid: string) => number | undefined
  /** True when any file is uploading (drives the total progress UI). */
  isUploading: () => boolean
}

// ---- helpers ----------------------------------------------------------------

let _uidSeed = 0
const nextUid = () => `upload_${Date.now().toString(36)}_${++_uidSeed}`

const toUploadFile = (f: File): UploadFile => ({
  uid: nextUid(),
  name: f.name,
  size: f.size,
  type: f.type,
  percent: 0,
  status: 'uploading',
  raw: f,
})

/**
 * The default XHR transport — FormData POST with progress events. Injected
 * as `request` in tests (happy-dom has no real XHR upload; the fake drives
 * the handlers directly).
 */
export const defaultUploadRequest =
  (init: {
    action: string | ((file: UploadFile) => string)
    name?: string
    method?: string
    headers?: Record<string, string>
    data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>)
  }): UploadRequest =>
  (file, handlers) => {
    const xhr = new XMLHttpRequest()
    const url = typeof init.action === 'function' ? init.action(file) : init.action
    const data = new FormData()
    const extra = typeof init.data === 'function' ? init.data(file) : init.data
    if (extra) {
      for (const [k, v] of Object.entries(extra)) data.append(k, String(v))
    }
    data.append(init.name ?? 'file', file.raw ?? new Blob([]), file.name)
    xhr.open(init.method ?? 'POST', url)
    for (const [k, v] of Object.entries(init.headers ?? {})) xhr.setRequestHeader(k, v)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        handlers.onProgress({ percent: Math.round((e.loaded / e.total) * 100) })
      }
    }
    xhr.onload = () => {
      let body: unknown
      try { body = JSON.parse(xhr.responseText) } catch { body = xhr.responseText }
      if (xhr.status >= 200 && xhr.status < 300) handlers.onSuccess(body)
      else handlers.onError(body)
    }
    xhr.onerror = () => handlers.onError(new Error('network error'))
    xhr.onabort = () => handlers.onError(new Error('aborted'))
    xhr.send(data)
    return { abort: () => xhr.abort() }
  }

// ---- machine ----------------------------------------------------------------

export const createUpload = (config: UploadConfig = {}): UploadIns => {
  const controlled = (): UploadFile[] | undefined => config.value

  const [_list, _setList] = createSignal<UploadFile[]>(
    (config.value ?? config.defaultValue ?? []).slice(),
    { ownedWrite: true },
  )

  // In-flight request handles per uid — abort needs the live xhr.
  const _aborts = new Map<string, () => void>()

  // Batch-proof pending mirror: _list reads may lag one batch (Solid 2
  // commits writes in batches), so imperative reads (post targets, remove
  // guards) go through this synchronous mirror — same pattern as
  // form.ts's storeRef.
  let _pending: UploadFile[] = (config.value ?? config.defaultValue ?? []).slice()
  const commit = (next: UploadFile[]) => {
    _pending = next
    _setList(next)
  }
  const listNow = (): UploadFile[] => _pending

  const fileList = createMemo(() => controlled() ?? _list())

  const request = (): UploadRequest =>
    config.request ??
    defaultUploadRequest({
      action: config.action ?? '',
      name: config.name,
      method: config.method,
      headers: config.headers,
      data: config.data,
    })

  /**
   * One atomic list write. The functional updater receives the CURRENT
   * pending list (Solid 2 batches — two adds in one tick must not lose
   * one) and the closure captures the computed snapshot synchronously
   * (owned-write updaters run immediately), so onChange fires with the
   * NEXT list even before the batch commits.
   */
  const commitList = (compute: (prev: UploadFile[]) => UploadFile[], eventFile?: UploadFile) => {
    const next = compute(_pending)
    commit(next)
    config.onChange?.({
      file: eventFile ?? next[next.length - 1],
      fileList: next.slice(),
    })
    return next
  }

  const patchFile = (uid: string, patch: Partial<UploadFile>) => {
    const next = commitList(prev => prev.map(f => (f.uid === uid ? { ...f, ...patch } : f)))
    return next.find(f => f.uid === uid)
  }

  // ---- upload pipeline -------------------------------------------------------

  const post = (uid?: string) => {
    if (untrack(() => config.disabled)) return
    const targets = listNow().filter(
      f => (uid === undefined || f.uid === uid) && f.status !== 'done',
    )
    for (const f0 of targets) {
      // Mark uploading (the request may resolve synchronously in tests —
      // status must read 'uploading' inside onSuccess handlers).
      const f = patchFile(f0.uid, { status: 'uploading', percent: f0.percent ?? 0 })!
      // In-flight guard: a file removed or aborted mid-request stops
      // accepting progress (checked against the pending mirror — the
      // request is currently live iff its abort handle is registered).
      const live = () => _aborts.has(f.uid)
      _aborts.set(f.uid, () => {})
      const handle = request()(f, {
        onProgress: (p) => {
          if (!live()) return // aborted or removed
          patchFile(f.uid, { percent: p.percent })
          config.onProgress?.({
            file: listNow().find(x => x.uid === f.uid)!,
            fileList: listNow(),
            percent: p.percent,
          })
        },
        onSuccess: (body) => {
          const wasLive = live()
          _aborts.delete(f.uid)
          if (!wasLive) return // aborted or removed mid-flight
          const done = patchFile(f.uid, { status: 'done', percent: 100, response: body })!
          config.onSuccess?.(done, listNow())
        },
        onError: (err) => {
          const wasLive = live()
          _aborts.delete(f.uid)
          if (!wasLive) return
          const failed = patchFile(f.uid, { status: 'error', error: err })!
          config.onError?.(failed, listNow(), err)
        },
      })
      _aborts.set(f.uid, handle.abort)
    }
  }

  // ---- add pipeline ---------------------------------------------------------

  const trimToMax = (next: UploadFile[], incoming: UploadFile[]): UploadFile[] => {
    const max = config.maxCount
    if (max === undefined || max <= 0) return next
    if (max === 1) return incoming // maxCount=1: the new file REPLACES the list
    return next.length > max ? next.slice(next.length - max) : next
  }

  const addFiles = (files: File[] | FileList, source: 'select' | 'drag') => {
    if (untrack(() => config.disabled)) return
    const arr = Array.from(files as ArrayLike<File>)
    if (!arr.length) return
    // Everything enters as pending candidates; beforeUpload may veto.
    void source // status/meta identical for select and drag; kept for API parity
    const modeled = arr.map(toUploadFile)
    const before = config.beforeUpload
    if (!before) {
      runAdd(modeled)
      return
    }
    // Keep selection order even when asynchronous cropping finishes out of order.
    const applyResult = (file: UploadFile, result: boolean | Blob | undefined): UploadFile | undefined => {
      if (result === false) return undefined
      if (result instanceof Blob) {
        const raw = result instanceof File ? result : new File([result], file.name, { type: result.type || file.type })
        return { ...file, raw, name: raw.name, size: raw.size, type: raw.type }
      }
      return file
    }
    const decided: Array<UploadFile | undefined> = new Array(modeled.length)
    let pending = 0
    const finish = () => { if (!config.disabled) runAdd(decided.filter((file): file is UploadFile => !!file)) }
    modeled.forEach((file, index) => {
      try {
        const result = before(file, [...listNow(), file])
        if (result && typeof result === 'object' && 'then' in result) {
          pending++
          Promise.resolve(result).then(value => {
            try { decided[index] = applyResult(file, value) } finally { if (--pending === 0) finish() }
          }, () => { if (--pending === 0) finish() })
        } else decided[index] = applyResult(file, result)
      } catch { /* A failed preprocessing hook rejects only this file. */ }
    })
    if (pending === 0) finish()
  }

  /** Post-veto insertion + optional auto-post. */
  const runAdd = (files: UploadFile[]) => {
    if (!files.length) return
    const eventFile = files[files.length - 1]
    commitList(prev => trimToMax([...prev, ...files], files), eventFile)
    if (config.autoUpload !== false) post()
  }

  const addFileItem = (file: UploadFile) => {
    if (untrack(() => config.disabled)) return
    commitList(prev => [...prev, file], file)
  }

  // ---- remove / abort ------------------------------------------------------

  const remove = (uid: string) => {
    const cur = listNow().find(f => f.uid === uid)
    if (!cur) return
    const gate = config.beforeRemove?.(cur, listNow())
    if (gate === false) return
    _aborts.get(uid)?.()
    _aborts.delete(uid)
    const snapshot = commitList(
      prev => prev.filter(f => f.uid !== uid),
      { ...cur, status: 'removed' },
    )
    config.onRemove?.(cur)
    return snapshot
  }

  const clear = () => {
    abort()
    commitList(() => [])
  }

  const abort = (uid?: string) => {
    if (uid === undefined) {
      for (const a of _aborts.values()) a()
      _aborts.clear()
      return
    }
    _aborts.get(uid)?.()
    _aborts.delete(uid)
  }

  // ---- preview / drag ------------------------------------------------------

  const [_previewUid, _setPreviewUid] = createSignal<string | undefined>(undefined, {
    ownedWrite: true,
  })

  const [_dragOver, _setDragOver] = createSignal(false, { ownedWrite: true })

  const isDisabled = () => !!config.disabled

  const percentOf = (uid: string): number | undefined =>
    fileList().find(f => f.uid === uid)?.percent

  const isUploading = () => fileList().some(f => f.status === 'uploading')

  const setFileList = (files: UploadFile[]) => {
    // Controlled-value sync — mirror unconditionally (the getter trap: a
    // controlled value passed through a getter never reads as undefined,
    // so presence-guards on config.value are unreliable here).
    commit(files.slice())
  }

  return {
    fileList,
    setFileList,
    addFiles,
    addFileItem,
    post,
    abort,
    remove,
    clear,
    previewUid: () => _previewUid(),
    setPreviewUid: _setPreviewUid,
    isDragOver: () => _dragOver(),
    notifyDragOver: (over: boolean) => {
      _setDragOver(over)
      config.onOpenChange?.(over)
    },
    isDisabled,
    percentOf,
    isUploading,
  }
}

export const uploadSplits: (keyof UploadConfig)[] = [
  'value',
  'defaultValue',
  'action',
  'data',
  'headers',
  'name',
  'method',
  'autoUpload',
  'maxCount',
  'directory',
  'disabled',
  'beforeUpload',
  'beforeRemove',
  'onChange',
  'onProgress',
  'onSuccess',
  'onError',
  'onRemove',
  'onDropReject',
]
