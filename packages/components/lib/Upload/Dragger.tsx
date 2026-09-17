import { Component, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import type { UploadFile, UploadRequest } from 'upthrust-competence'
import { createUpload, type UploadIns } from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import type { SizeType } from '../../common/type'
import {
  draggerClass,
  draggerIconClass,
  draggerHintClass,
  draggerHintStrongClass,
  uploadListClass,
  uploadListItemClass,
  uploadItemNameClass,
  uploadItemRemoveClass,
  uploadItemStatusIconClass,
  uploadItemSizeClass,
  uploadProgressTrackClass,
  uploadProgressFillClass,
  uploadPercentTextClass,
} from './styles'

export interface DraggerProps {
  /** Controlled file list. */
  value?: UploadFile[]
  defaultValue?: UploadFile[]
  action?: string | ((file: UploadFile) => string)
  data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>)
  headers?: Record<string, string>
  name?: string
  method?: string
  request?: UploadRequest
  autoUpload?: boolean
  maxCount?: number
  accept?: string
  multiple?: boolean
  directory?: boolean
  disabled?: boolean
  height?: number | string
  /** Copy above the icon, e.g. "拖拽文件到此处". */
  hint?: JSX.Element
  /** Copy inside the icon line, e.g. "或 点击上传". */
  hintStrong?: JSX.Element
  size?: SizeType
  status?: 'error' | 'warning'
  id?: string
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  beforeUpload?: (file: UploadFile, fileList: UploadFile[]) => boolean | Blob | Promise<boolean | Blob | undefined> | undefined
  beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void
  onProgress?: (info: { file: UploadFile; fileList: UploadFile[]; percent: number }) => void
  onSuccess?: (file: UploadFile, fileList: UploadFile[]) => void
  onError?: (file: UploadFile, fileList: UploadFile[], error: unknown) => void
  onRemove?: (file: UploadFile) => void
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
            : a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        )
        .join('|') +
      '$',
    'i',
  )

/**
 * Upload.Dragger — the dashed drop-zone variant. Shares the createUpload
 * machine with Upload (a separate instance: Dragger composes as a peer,
 * not a sub-list). Click falls through to the native picker; drag events
 * route DataTransfer files through the same addFiles pipeline.
 */
const Dragger: Component<DraggerProps> = (rawProps) => {
  const props = merge(
    { multiple: true, hint: '单击或拖拽文件到此区域上传' as JSX.Element },
    rawProps,
  )

  const form = useFormItem({
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })
  const resolvedDisabled = () => form.disabled()

  const machine = createUpload({
    get value() { return props.value as UploadFile[] | undefined },
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
    get onChange() { return props.onChange },
    get onProgress() { return props.onProgress },
    get onSuccess() { return props.onSuccess },
    get onError() { return props.onError },
    get onRemove() { return props.onRemove },
  })
  const m = () => machine
  props.ref?.(machine)

  const inputId = `upthrust-dragger-${Math.random().toString(36).slice(2)}`

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    m().notifyDragOver(false)
    if (resolvedDisabled()) return
    const files = Array.from(e.dataTransfer?.files ?? [])
    if (!files.length) return
    if (props.accept) {
      const re = acceptRegex(props.accept)
      const ok = files.filter(f => re.test(f.type) || re.test(f.name))
      const bad = files.filter(f => !re.test(f.type) && !re.test(f.name))
      if (bad.length) {
        props.onDropReject?.(bad)
        if (ok.length) m().addFiles(ok, 'drag')
        return
      }
      m().addFiles(files, 'drag')
    } else {
      m().addFiles(files, 'drag')
    }
  }

  const fileList = createMemo(() => m().fileList())

  const boxStyle = createMemo(() => ({
    ...(props.height !== undefined
      ? { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
      : {}),
  }))

  return (
    <div class={twMerge('inline-flex flex-col min-w-0', props.class)} style={props.style}>
      <input
        id={inputId}
        type="file"
        class="hidden"
        accept={props.accept}
        multiple={props.multiple !== false}
        disabled={resolvedDisabled()}
        onChange={(e) => {
          const files = Array.from((e.target as HTMLInputElement).files ?? [])
          if (files.length) m().addFiles(files, 'select')
          ;(e.target as HTMLInputElement).value = ''
        }}
      />
      <div
        class={draggerClass({
          dragOver: m().isDragOver(),
          disabled: !!resolvedDisabled(),
          status: form.status() ?? 'default',
        })}
        style={boxStyle()}
        role="button"
        tabindex={resolvedDisabled() ? -1 : 0}
        aria-disabled={resolvedDisabled() ? 'true' : 'false'}
        onClick={() => !resolvedDisabled() && document.getElementById(inputId)?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!resolvedDisabled()) document.getElementById(inputId)?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!resolvedDisabled()) m().notifyDragOver(true)
        }}
        onDragLeave={() => m().notifyDragOver(false)}
        onDrop={handleDrop}
      >
        <span class={draggerIconClass()} />
        <div class={draggerHintClass()}>
          <Show when={props.hintStrong} fallback={props.hint}>
            <span>{props.hint}</span>
            <span class={draggerHintStrongClass()} onClick={(e) => e.stopPropagation()}>
              {props.hintStrong}
            </span>
          </Show>
        </div>
        <Show when={props.children}>{props.children}</Show>
      </div>
      <Show when={fileList().length > 0}>
        <div class={uploadListClass({ size: form.size() })}>
          {fileList().map((file) => (
            <div class={uploadListItemClass({ state: file.status ?? 'done', size: form.size() })}>
              <span class={uploadItemStatusIconClass((file.status ?? 'done') as 'uploading' | 'done' | 'error')} />
              <span class={uploadItemNameClass()} title={file.name}>
                {isImage(file) && file.url ? '' : ''}
                {file.name}
              </span>
              <span class={uploadItemSizeClass()}>{formatSize(file.size)}</span>
              <Show when={file.status === 'uploading'}>
                <div class="flex items-center gap-[8px] w-[160px]">
                  <div class={uploadProgressTrackClass()}>
                    <div class={uploadProgressFillClass('uploading')} style={{ width: `${file.percent ?? 0}%` }} />
                  </div>
                  <span class={uploadPercentTextClass()}>{file.percent ?? 0}%</span>
                </div>
              </Show>
              <span
                class={uploadItemRemoveClass()}
                role="button"
                aria-label="移除"
                tabindex={-1}
                onClick={() => m().remove(file.uid)}
              >
                <span class="i-mdi-close" />
              </span>
            </div>
          ))}
        </div>
      </Show>
    </div>
  )
}

export default Dragger
