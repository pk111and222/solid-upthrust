import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { UploadFile, UploadRequest, UploadIns } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export interface DraggerProps {
    /** Controlled file list. */
    value?: UploadFile[];
    defaultValue?: UploadFile[];
    action?: string | ((file: UploadFile) => string);
    data?: Record<string, unknown> | ((file: UploadFile) => Record<string, unknown>);
    headers?: Record<string, string>;
    name?: string;
    method?: string;
    request?: UploadRequest;
    autoUpload?: boolean;
    maxCount?: number;
    accept?: string;
    multiple?: boolean;
    directory?: boolean;
    disabled?: boolean;
    height?: number | string;
    /** Copy above the icon, e.g. "拖拽文件到此处". */
    hint?: JSX.Element;
    /** Copy inside the icon line, e.g. "或 点击上传". */
    hintStrong?: JSX.Element;
    size?: SizeType;
    status?: 'error' | 'warning';
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    beforeUpload?: (file: UploadFile, fileList: UploadFile[]) => boolean | Blob | Promise<boolean | Blob | undefined> | undefined;
    beforeRemove?: (file: UploadFile, fileList: UploadFile[]) => boolean;
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
    onDropReject?: (files: File[]) => void;
    onPreview?: (file: UploadFile) => void;
    ref?: (machine: UploadIns) => void;
}
/**
 * Upload.Dragger — the dashed drop-zone variant. Shares the createUpload
 * machine with Upload (a separate instance: Dragger composes as a peer,
 * not a sub-list). Click falls through to the native picker; drag events
 * route DataTransfer files through the same addFiles pipeline.
 */
declare const Dragger: Component<DraggerProps>;
export default Dragger;
