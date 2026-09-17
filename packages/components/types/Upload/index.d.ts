import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { UploadFile, UploadIns, UploadRequest } from 'upthrust-competence';
import { SizeType } from '../../common/type';
import { default as Dragger } from './Dragger';
export type { UploadFile, UploadRequest };
export type UploadListType = 'text' | 'picture' | 'picture-card';
export interface UploadListActions {
    preview: () => void;
    remove: () => void;
    download: () => void;
    retry: () => void;
}
export interface UploadListConfig {
    showPreviewIcon?: boolean | ((file: UploadFile) => boolean);
    showRemoveIcon?: boolean | ((file: UploadFile) => boolean);
    showDownloadIcon?: boolean | ((file: UploadFile) => boolean);
    previewIcon?: JSX.Element | ((file: UploadFile) => JSX.Element);
    removeIcon?: JSX.Element | ((file: UploadFile) => JSX.Element);
    downloadIcon?: JSX.Element | ((file: UploadFile) => JSX.Element);
    extra?: JSX.Element | ((file: UploadFile) => JSX.Element);
}
export interface UploadProps {
    /** Controlled file list. */
    value?: UploadFile[];
    defaultValue?: UploadFile[];
    /** Upload endpoint (string or per-file). */
    action?: string | ((file: UploadFile) => string);
    /** Extra FormData fields. */
    data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>);
    /** Request headers (default XHR transport). */
    headers?: Record<string, string>;
    /** File part field name. Default 'file'. */
    name?: string;
    /** HTTP method. Default POST. */
    method?: string;
    /** Transport override (custom fetch adapters). */
    request?: UploadRequest;
    /** Post immediately after add. Default true. */
    autoUpload?: boolean;
    /** 1 = replace; >1 = trim oldest overflow. */
    maxCount?: number;
    /** Native accept attribute. */
    accept?: string;
    /** Allow multiple selection. Default true (antd false for picture-card). */
    multiple?: boolean;
    /** Select directories (webkitdirectory). */
    directory?: boolean;
    disabled?: boolean;
    /** (file, fileList) => boolean | Promise; false drops the file pre-list. */
    beforeUpload?: (file: UploadFile, fileList: UploadFile[]) => boolean | Blob | Promise<boolean | Blob | undefined> | undefined;
    /** Gate removal; false cancels. */
    beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean;
    listType?: UploadListType;
    /** Show the list. Default true. */
    showList?: boolean;
    /** Overrides the legacy showList flag; action visibility may vary by file. */
    showUploadList?: boolean | UploadListConfig;
    itemRender?: (originNode: JSX.Element, file: UploadFile, fileList: UploadFile[], actions: UploadListActions) => JSX.Element;
    iconRender?: (file: UploadFile, listType: UploadListType) => JSX.Element;
    onDownload?: (file: UploadFile) => void;
    /** Start the picker from the default button ("点击上传"). */
    defaultText?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    /** Custom upload trigger — replaces the default button entirely. */
    children?: JSX.Element;
    onChange?: (info: {
        file: UploadFile;
        fileList: UploadFile[];
    }) => void;
    onProgress?: (info: {
        file: UploadFile;
        fileList: UploadFile[];
        percent: number;
    }) => void;
    onSuccess?: (file: UploadFile, fileList: UploadFile[]) => void;
    onError?: (file: UploadFile, fileList: UploadFile[], error: unknown) => void;
    onRemove?: (file: UploadFile) => void;
    /** Fired for rejected dropped files (accept mismatch). */
    onDropReject?: (files: File[]) => void;
    onPreview?: (file: UploadFile) => void;
    ref?: (machine: UploadIns) => void;
}
export { Dragger };
export type { DraggerProps } from './Dragger';
declare const UploadWithDragger: Component<UploadProps> & {
    Dragger: Component<import('./Dragger').DraggerProps>;
};
export default UploadWithDragger;
