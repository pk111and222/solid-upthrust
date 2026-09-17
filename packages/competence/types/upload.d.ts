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
export type UploadFileStatus = 'uploading' | 'done' | 'error' | 'removed';
/** The canonical item in the (controlled or internal) list. */
export type UploadFile = {
    /** Stable identity (antd's uid). Generated here; consumers may seed their own. */
    uid: string;
    /** File name (display + fallback alt). */
    name: string;
    /** MIME type. */
    type?: string;
    /** Size in bytes. */
    size?: number;
    /** Percent complete, 0-100. */
    percent?: number;
    status?: UploadFileStatus;
    /** Server response payload (echoed from the request's success result). */
    response?: unknown;
    /** Error payload from the failed request, if any. */
    error?: unknown;
    /** Object URL for preview rendering (browser-only; created by the UI layer). */
    url?: string;
    /** The raw File handle (absent for server-seeded defaultValue items). */
    raw?: File;
    [key: string]: unknown;
};
export type UploadRequestProgress = {
    /** 0-100. */
    percent: number;
};
export type UploadRequestResult = {
    status: 'success' | 'error';
    /** Server body stored on the file as `response` / `error`. */
    body?: unknown;
};
/**
 * The transport contract. The default implementation is XHR-based; tests
 * inject fakes. An in-flight request can be canceled through `abort`.
 */
export type UploadRequest = (file: UploadFile, handlers: {
    onProgress: (p: UploadRequestProgress) => void;
    onSuccess: (body?: unknown) => void;
    onError: (err?: unknown) => void;
}) => {
    abort: () => void;
};
export type UploadConfig = {
    /** Controlled list (the value channel). */
    value?: UploadFile[];
    defaultValue?: UploadFile[];
    /** Upload endpoint. Required for the default XHR request. */
    action?: string | ((file: UploadFile) => string);
    /** Additional fields appended to the FormData (or fn per file). */
    data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>);
    /** Request headers for the default XHR transport. */
    headers?: Record<string, string>;
    /** Field name for the file part of the FormData. Default 'file'. */
    name?: string;
    /** 'POST' etc. Default POST. */
    method?: string;
    /** Transport override (tests / custom fetch adapters). */
    request?: UploadRequest;
    /** Post immediately after add. Default true. */
    autoUpload?: boolean;
    /** maxCount semantics: 1 replaces the list; >1 trims the OLDEST overflow. */
    maxCount?: number;
    /** Show directory picker content (UI concern) but must accept folders. */
    directory?: boolean;
    /** 'select' | 'drag' — reported to beforeUpload. */
    disabled?: boolean;
    /** (file, fileList) => boolean | Promise<boolean>; false drops the file BEFORE it enters the list. */
    beforeUpload?: (file: UploadFile, fileList: UploadFile[]) => boolean | Blob | Promise<boolean | Blob | undefined> | undefined;
    /** Gate removal; false cancels. */
    beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean;
    onChange?: (info: {
        file: UploadFile;
        fileList: UploadFile[];
    }) => void;
    /** Fired on every status transition (antd onStatusChange — subset of onChange in practice). */
    onProgress?: (info: {
        file: UploadFile;
        fileList: UploadFile[];
        percent: number;
    }) => void;
    onSuccess?: (file: UploadFile, fileList: UploadFile[]) => void;
    onError?: (file: UploadFile, fileList: UploadFile[], error: unknown) => void;
    onRemove?: (file: UploadFile) => void;
    /** Called when the accept-check rejects a picked file (antd: onDrop). */
    onDropReject?: (files: File[]) => void;
    /** Open state of the drag overlay (Dragger UI mirrors this). */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: unknown[];
};
export type UploadIns = {
    /** The effective list (controlled wins). */
    fileList: () => UploadFile[];
    /** Set the whole list (controlled-value sync from the UI layer). */
    setFileList: (files: UploadFile[]) => void;
    /** Entry point for both picker picks and drops. Runs the add pipeline. */
    addFiles: (files: File[] | FileList, source: 'select' | 'drag') => void;
    /** Enqueue one already-modeled file (list seeding). */
    addFileItem: (file: UploadFile) => void;
    /** Manually start upload (autoUpload false, retry after error). */
    post: (uid?: string) => void;
    /** Cancel in-flight request(s). Without uid: all. */
    abort: (uid?: string) => void;
    /** Remove from the list (gated by beforeRemove). */
    remove: (uid: string) => void;
    /** Clear the whole list. */
    clear: () => void;
    /** uid of the file being previewed (zoom modal — the UI layer renders it). */
    previewUid: () => string | undefined;
    setPreviewUid: (uid: string | undefined) => void;
    /** Drag overlay state (Dragger's dashed frame highlight). */
    isDragOver: () => boolean;
    notifyDragOver: (over: boolean) => void;
    isDisabled: () => boolean;
    /** 0-100 for a single file, or null when nothing is uploading. */
    percentOf: (uid: string) => number | undefined;
    /** True when any file is uploading (drives the total progress UI). */
    isUploading: () => boolean;
};
/**
 * The default XHR transport — FormData POST with progress events. Injected
 * as `request` in tests (happy-dom has no real XHR upload; the fake drives
 * the handlers directly).
 */
export declare const defaultUploadRequest: (init: {
    action: string | ((file: UploadFile) => string);
    name?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>);
}) => UploadRequest;
export declare const createUpload: (config?: UploadConfig) => UploadIns;
export declare const uploadSplits: (keyof UploadConfig)[];
