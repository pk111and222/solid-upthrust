import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createMemo, createSignal, merge, onCleanup } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createUpload,
  createOwnerCleanup,
  type UploadFile,
  type UploadIns,
  type UploadRequest,
} from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import type { SizeType } from '../../common/type'
import {
  uploadButtonClass,
  uploadListClass,
  uploadListItemClass,
  uploadItemNameClass,
  uploadItemRemoveClass,
  uploadItemStatusIconClass,
  uploadPictureItemClass,
  uploadPictureThumbClass,
  uploadItemMetaClass,
  uploadItemSizeClass,
  uploadCardItemClass,
  uploadCardTileClass,
  uploadCardActionsClass,
  uploadCardActionBtnClass,
  uploadCardErrorMarkClass,
  uploadCardErrorIconClass,
  uploadCardAddTileClass,
  uploadCardAddIconClass,
  uploadProgressTrackClass,
  uploadProgressFillClass,
  uploadPercentTextClass,
  uploadPreviewClass,
  uploadPreviewImgClass,
  uploadPreviewCloseClass,
} from './styles'

export type { UploadFile, UploadRequest }
export type UploadListType = 'text' | 'picture' | 'picture-card'
export interface UploadListActions { preview: () => void; remove: () => void; download: () => void; retry: () => void }
export interface UploadListConfig {
  showPreviewIcon?: boolean | ((file: UploadFile) => boolean)
  showRemoveIcon?: boolean | ((file: UploadFile) => boolean)
  showDownloadIcon?: boolean | ((file: UploadFile) => boolean)
  previewIcon?: JSX.Element | ((file: UploadFile) => JSX.Element)
  removeIcon?: JSX.Element | ((file: UploadFile) => JSX.Element)
  downloadIcon?: JSX.Element | ((file: UploadFile) => JSX.Element)
  extra?: JSX.Element | ((file: UploadFile) => JSX.Element)
}

export interface UploadProps {
  /** Controlled file list. */
  value?: UploadFile[]
  defaultValue?: UploadFile[]
  /** Upload endpoint (string or per-file). */
  action?: string | ((file: UploadFile) => string)
  /** Extra FormData fields. */
  data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>)
  /** Request headers (default XHR transport). */
  headers?: Record<string, string>
  /** File part field name. Default 'file'. */
  name?: string
  /** HTTP method. Default POST. */
  method?: string
  /** Transport override (custom fetch adapters). */
  request?: UploadRequest
  /** Post immediately after add. Default true. */
  autoUpload?: boolean
  /** 1 = replace; >1 = trim oldest overflow. */
  maxCount?: number
  /** Native accept attribute. */
  accept?: string
  /** Allow multiple selection. Default true (antd false for picture-card). */
  multiple?: boolean
  /** Select directories (webkitdirectory). */
  directory?: boolean
  disabled?: boolean
  /** (file, fileList) => boolean | Promise; false drops the file pre-list. */
  beforeUpload?: (file: UploadFile, fileList: UploadFile[]) => boolean | Blob | Promise<boolean | Blob | undefined> | undefined
  /** Gate removal; false cancels. */
  beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean
  listType?: UploadListType
  /** Show the list. Default true. */
  showList?: boolean
  /** Overrides the legacy showList flag; action visibility may vary by file. */
  showUploadList?: boolean | UploadListConfig
  itemRender?: (originNode: JSX.Element, file: UploadFile, fileList: UploadFile[], actions: UploadListActions) => JSX.Element
  iconRender?: (file: UploadFile, listType: UploadListType) => JSX.Element
  onDownload?: (file: UploadFile) => void
  /** Start the picker from the default button ("点击上传"). */
  defaultText?: string
  size?: SizeType
  status?: 'error' | 'warning'
  id?: string
  class?: string
  style?: JSX.CSSProperties
  /** Custom upload trigger — replaces the default button entirely. */
  children?: JSX.Element
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void
  onProgress?: (info: { file: UploadFile; fileList: UploadFile[]; percent: number }) => void
  onSuccess?: (file: UploadFile, fileList: UploadFile[]) => void
  onError?: (file: UploadFile, fileList: UploadFile[], error: unknown) => void
  onRemove?: (file: UploadFile) => void
  /** Fired for rejected dropped files (accept mismatch). */
  onDropReject?: (files: File[]) => void
  onPreview?: (file: UploadFile) => void
  ref?: (machine: UploadIns) => void
}

const isImage = (f: UploadFile) => f.type?.startsWith('image/') ?? false

const formatSize = (bytes?: number) => {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Object URL lifecycle: one URL per uid, revoked when the file leaves. */
const makeUrlPool = () => {
  const urls = new Map<string, string>()
  const pool = {
    urlOf: (f: UploadFile): string | undefined => {
      if (f.url) return f.url
      if (!f.raw || !isImage(f)) return undefined
      let u = urls.get(f.uid)
      if (!u) {
        u = URL.createObjectURL(f.raw)
        urls.set(f.uid, u)
      }
      return u
    },
    revoke: (uid: string) => {
      const u = urls.get(uid)
      if (u) {
        URL.revokeObjectURL(u)
        urls.delete(uid)
      }
    },
    /** Revoke every URL still alive (component teardown). */
    urls: () => urls.values(),
    keys: () => urls.keys(),
  }
  return pool
}

const Upload: Component<UploadProps> = (providedProps) => {
  const rawProps = useComponentProps('Upload', providedProps)
  const props = merge(
    {
      listType: 'text' as UploadListType,
      showList: true,
      multiple: true,
      size: 'middle' as SizeType,
      defaultText: '点击上传',
    } as Partial<UploadProps>,
    rawProps,
  )

  const form = useFormItem({
    get value() { return props.value },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedDisabled = () => form.disabled()
  const resolvedStatus = () => form.status()

  // Created ONCE in the component body (the createMemo-wraps-machine pitfall).
  const machine = createUpload({
    get value() { return form.value() as UploadFile[] | undefined },
    get defaultValue() { return props.defaultValue },
    get action() { return props.action },
    get data() { return props.data },
    get headers() { return props.headers },
    get name() { return props.name },
    get method() { return props.method },
    get request() { return props.request },
    get autoUpload() { return props.autoUpload },
    get maxCount() { return props.maxCount },
    get directory() { return props.directory },
    get disabled() { return resolvedDisabled() },
    get beforeUpload() { return props.beforeUpload },
    get beforeRemove() { return props.beforeRemove },
    onChange: info => { form.onChange(info.fileList); props.onChange?.(info) },
    get onProgress() { return props.onProgress },
    get onSuccess() { return props.onSuccess },
    get onError() { return props.onError },
    get onRemove() { return props.onRemove },
    get onDropReject() { return props.onDropReject },
  })
  const m = () => machine
  props.ref?.(machine)

  const urlPool = makeUrlPool()
  onCleanup(() => { for (const u of urlPool.urls()) URL.revokeObjectURL(u) })

  // ---- the picker -----------------------------------------------------------

  const inputId = `upthrust-upload-${Math.random().toString(36).slice(2)}`

  const openPicker = () => {
    if (resolvedDisabled()) return
    document.getElementById(inputId)?.click()
  }

  /** The hidden native input — the ONLY file source (pick + drop both). */
  const hiddenInput = (
    <input
      id={inputId}
      type="file"
      class="hidden"
      accept={props.accept}
      multiple={props.multiple !== false}
      disabled={resolvedDisabled()}
      onChange={(e) => {
        const files = Array.from((e.target as HTMLInputElement).files ?? [])
        // accept gate: the native picker pre-filters, but a manual check
        // keeps programmatic/drag paths honest.
        if (props.accept) {
          const re = acceptRegex(props.accept)
          const ok = files.filter(f => re.test(f.type) || re.test(f.name))
          const bad = files.filter(f => !re.test(f.type) && !re.test(f.name))
          if (bad.length) {
            props.onDropReject?.(bad)
            if (ok.length) m().addFiles(ok, 'select')
          } else {
            m().addFiles(files, 'select')
          }
        } else {
          m().addFiles(files, 'select')
        }
        // Reset so picking the SAME file again re-fires change.
        ;(e.target as HTMLInputElement).value = ''
      }}
    />
  )

  const trigger = () =>
    props.children ?? (
      <button
        type="button"
        class={uploadButtonClass({ size: form.size(), disabled: resolvedDisabled(), status: resolvedStatus() ?? 'default' })}
        disabled={resolvedDisabled()}
        onClick={openPicker}
      >
        <span class="i-mdi-upload" />
        <span>{props.defaultText}</span>
      </button>
    )

  // ---- zoom preview ---------------------------------------------------------

  const [previewSrc, setPreviewSrc] = createSignal<string | undefined>(undefined)

  const previewUrl = (f: UploadFile) => (f.url ? f.url : urlPool.urlOf(f))

  const openPreview = (f: UploadFile) => {
    if (props.onPreview) {
      props.onPreview(f)
      return
    }
    setPreviewSrc(previewUrl(f))
  }

  // Esc closes the zoom overlay; scroll lock while open.
  createEffect(
    () => previewSrc(),
    (src) => {
      if (!src) return
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setPreviewSrc(undefined)
      }
      document.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', onKey)
      }
    },
  )
  onCleanup(() => {
    if (previewSrc()) document.body.style.overflow = ''
  })

  // ---- list rendering -------------------------------------------------------

  const fileList = createMemo(() => m().fileList())
  createEffect(() => fileList().map(file => file.uid), keys => {
    const keep = new Set(keys)
    for (const key of urlPool.keys()) if (!keep.has(key)) urlPool.revoke(key)
  })

  const listConfig = () => typeof props.showUploadList === 'object' ? props.showUploadList : {}
  const visibleAction = (name: 'showPreviewIcon' | 'showRemoveIcon' | 'showDownloadIcon', file: UploadFile) => {
    const option = listConfig()[name]
    return typeof option === 'function' ? option(file) : option ?? name !== 'showDownloadIcon'
  }
  const renderOption = (option: JSX.Element | ((file: UploadFile) => JSX.Element), file: UploadFile) => typeof option === 'function' ? option(file) : option
  const removeAt = (file: UploadFile) => { if (!resolvedDisabled()) m().remove(file.uid) }
  const download = (file: UploadFile) => {
    if (props.onDownload) { props.onDownload(file); return }
    const url = previewUrl(file)
    if (!url || !/^(https?:|blob:|data:|\/|\.\/|\.\.\/)/i.test(url)) return
    const link = document.createElement('a'); link.href = url; link.download = file.name; link.rel = 'noopener noreferrer'; link.click()
  }
  const Action: Component<{ kind: 'preview' | 'remove' | 'download'; file: UploadFile; card?: boolean }> = p => {
    const key = () => p.kind === 'remove' ? 'showRemoveIcon' : p.kind === 'preview' ? 'showPreviewIcon' : 'showDownloadIcon'
    const icon = () => p.kind === 'remove' ? listConfig().removeIcon : p.kind === 'preview' ? listConfig().previewIcon : listConfig().downloadIcon
    return <Show when={visibleAction(key(), p.file)}>
      <button type="button" class={twMerge(p.card ? uploadCardActionBtnClass() : uploadItemRemoveClass(), 'border-0 bg-transparent p-0 inline-flex')}
        disabled={p.kind === 'remove' && resolvedDisabled()} aria-label={p.kind === 'remove' ? '移除' : p.kind === 'preview' ? '预览' : '下载'}
        onClick={e => { e.stopPropagation(); if (p.kind === 'remove') removeAt(p.file); else if (p.kind === 'preview') openPreview(p.file); else download(p.file) }}>
        {icon() === undefined ? <span class={p.kind === 'remove' ? 'i-mdi-close' : p.kind === 'preview' ? 'i-mdi-eye-outline' : 'i-mdi-download'} /> : renderOption(icon(), p.file)}
      </button>
    </Show>
  }

  const ItemRow: Component<{ file: UploadFile }> = (p) => {
    const state = () => p.file.status ?? 'pending'
    const pct = () => p.file.percent ?? 0
    const url = () => urlPool.urlOf(p.file)
    return (
      <Show
        when={props.listType === 'picture'}
        fallback={
          <Show
            when={props.listType === 'picture-card'}
            fallback={
              /* ---- text row ---- */
              <div class={uploadListItemClass({ state: state(), size: form.size() })}>
                {props.iconRender?.(p.file, props.listType ?? 'text') ?? <span class={uploadItemStatusIconClass(state())} />}
                <Show when={url()}>
                  <img src={url()} alt={p.file.name} class="w-[20px] h-[20px] rounded-sm object-cover shrink-0" />
                </Show>
                <span
                  class={uploadItemNameClass()}
                  title={p.file.name}
                  onClick={() => visibleAction('showPreviewIcon', p.file) && url() && openPreview(p.file)}
                >
                  {p.file.name}
                </span>
                <Show when={p.file.size !== undefined}>
                  <span class={uploadItemSizeClass()}>{formatSize(p.file.size)}</span>
                </Show>
                <Action kind="remove" file={p.file} /><Action kind="download" file={p.file} />
              </div>
            }
          >
            {/* ---- picture-card tile ---- */}
            <div class={uploadCardItemClass({ state: state() })}>
              <Show
                when={url()}
                fallback={
                  <div class={uploadCardTileClass()}>
                    <span class="i-mdi-file-document-outline text-[28px] text-on-surface/30" />
                  </div>
                }
              >
                <img src={url()} alt={p.file.name} class="w-full h-full object-cover" onClick={() => visibleAction('showPreviewIcon', p.file) && openPreview(p.file)} />
              </Show>
              <Show when={state() === 'error'}>
                <div class={uploadCardErrorMarkClass()} />
                <span class={uploadCardErrorIconClass()} />
              </Show>
              <Show when={state() !== 'uploading'}>
                <div class={uploadCardActionsClass()}>
                  <Action kind="preview" file={p.file} card />
                  <Action kind="remove" file={p.file} card /><Action kind="download" file={p.file} card />
                </div>
              </Show>
              <Show when={state() === 'uploading'}>
                <div class="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-[6px] text-white">
                  <span>{pct()}%</span>
                  <div class={twMerge(uploadProgressTrackClass(), 'bg-white/25')}>
                    <div class={uploadProgressFillClass('uploading')} style={{ width: `${pct()}%` }} />
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        }
      >
        {/* ---- picture row ---- */}
        <div class={uploadPictureItemClass({ state: state() })}>
          <div class={uploadPictureThumbClass()} onClick={() => visibleAction('showPreviewIcon', p.file) && openPreview(p.file)}>
            <Show
              when={url()}
              fallback={<span class="i-mdi-file-document-outline text-[20px] text-on-surface/30" />}
            >
              <img src={url()} alt={p.file.name} class="w-full h-full object-cover" />
            </Show>
          </div>
          <div class={uploadItemMetaClass()}>
            <div class="flex items-center gap-[8px]">
              {props.iconRender?.(p.file, props.listType ?? 'text') ?? <span class={uploadItemStatusIconClass(state())} />}
              <span class="flex-1 min-w-0 truncate" title={p.file.name}>{p.file.name}</span>
              <Action kind="remove" file={p.file} /><Action kind="download" file={p.file} />
            </div>
            <span class={uploadItemSizeClass()}>{formatSize(p.file.size)}</span>
            <Show when={state() === 'uploading'}>
              <div class="flex items-center gap-[8px]">
                <div class={uploadProgressTrackClass()}>
                  <div class={uploadProgressFillClass('uploading')} style={{ width: `${pct()}%` }} />
                </div>
                <span class={uploadPercentTextClass()}>{pct()}%</span>
              </div>
            </Show>
            <Show when={state() === 'error'}>
              <span class="text-[12px] text-error">上传失败</span>
            </Show>
          </div>
        </div>
      </Show>
    )
  }

  return (
    <div class={twMerge('inline-flex flex-col min-w-0', props.class)} style={props.style}>
      {hiddenInput}
      <div class="flex items-center gap-[8px]">
        <Show when={props.listType !== 'picture-card'} fallback={
          <div class={uploadCardAddTileClass(!!resolvedDisabled())} onClick={openPicker}>
            <span class={uploadCardAddIconClass()} />
            <span>上传</span>
          </div>
        }>
          {trigger()}
        </Show>
        <Show when={props.autoUpload === false && fileList().some((f: UploadFile) => f.status !== 'done')}>
          <button
            type="button"
            class={uploadButtonClass({ size: form.size() })}
            onClick={() => m().post()}
          >
            <span class="i-mdi-cloud-upload-outline" />
            <span>开始上传</span>
          </button>
        </Show>
      </div>
      <Show when={(props.showUploadList ?? props.showList) !== false && fileList().length > 0}>
        <div
          class={props.listType === 'picture-card'
            ? 'grid grid-cols-[repeat(auto-fill,minmax(104px,104px))] gap-[8px] mt-[8px]'
            : uploadListClass({ size: form.size() })}
        >
          <For each={fileList()}>
            {file => <div class="min-w-0">
              {props.itemRender ? props.itemRender(<ItemRow file={file} />, file, fileList(), {
                preview: () => openPreview(file), remove: () => removeAt(file), download: () => download(file), retry: () => { if (!resolvedDisabled()) m().post(file.uid) },
              }) : <ItemRow file={file} />}
              {renderOption(listConfig().extra, file)}
            </div>}
          </For>
        </div>
      </Show>

      {/* Fullscreen zoom (no onPreview override, image files only). */}
      <Portal>
        <Show when={previewSrc()}>
          <div class={uploadPreviewClass()} onClick={() => setPreviewSrc(undefined)}>
            <img class={uploadPreviewImgClass()} src={previewSrc()} alt="" onClick={(e) => e.stopPropagation()} />
            <button
              type="button"
              class={uploadPreviewCloseClass()}
              aria-label="关闭"
              onClick={(e) => { e.stopPropagation(); setPreviewSrc(undefined) }}
            >
              <span class="i-mdi-close" />
            </button>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

/** accept attribute → regex (".png,.jpg" / "image/*" forms). */
const acceptRegex = (accept: string) =>
  new RegExp(
    '^' +
      accept
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a) =>
          a.endsWith('/*')
            ? a.replace(/[.*+?^${}()|[\]\\]/g, (ch) => (ch === '*' ? '.*' : `\\${ch}`))
            : a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\.[a-z0-9]+$/i, (ext) => ext.replace('\\.', '\\.')),
        )
        .join('|') +
      '$',
    'i',
  )

// antd-style compound access: <Upload.Dragger>. The named export remains
// the tree-shakeable entry.
import Dragger from './Dragger'
export { Dragger }
export type { DraggerProps } from './Dragger'

const UploadWithDragger = Object.assign(Upload, { Dragger })
export default UploadWithDragger
