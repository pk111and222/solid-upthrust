import { Ecc, QrCode } from './qrcodegen';
export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';
export type QRCodeModules = boolean[][];
export interface QRCodeExcavation {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface QRCodeImageSettings {
    src: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    opacity?: number;
    excavate?: boolean;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
}
export interface QRCodeCalculatedImage {
    x: number;
    y: number;
    w: number;
    h: number;
    excavation: QRCodeExcavation | null;
    opacity: number;
    crossOrigin?: QRCodeImageSettings['crossOrigin'];
}
export declare const QRCODE_ERROR_LEVEL_MAP: Record<QRCodeErrorLevel, Ecc>;
export declare const QRCODE_SPEC_MARGIN_SIZE = 4;
export declare const QRCODE_DEFAULT_IMG_SCALE = 0.1;
/** 行程编码路径：每行连续暗模块合并为一个矩形（与 rc 输出逐字一致，包括行末分支的逗号写法）。 */
export declare const generateQRCodePath: (modules: QRCodeModules, margin?: number) => string;
/** 把图标区域内的模块清空（excavate）。 */
export declare const excavateQRCodeModules: (modules: QRCodeModules, excavation: QRCodeExcavation) => QRCodeModules;
/** 图标在模块坐标系里的位置与挖空区域；size 为绘制像素尺寸。 */
export declare const getQRCodeImageSettings: (cells: QRCodeModules, size: number, margin: number, imageSettings?: QRCodeImageSettings) => QRCodeCalculatedImage | null;
/** 静区：显式 marginSize 取整且不小于 0；否则 includeMargin ? 4 : 0。 */
export declare const getQRCodeMarginSize: (includeMargin: boolean, marginSize?: number) => number;
export interface QRCodeMatrixOptions {
    /** 字符串或分段数组；每段自动选择数字 / 字母数字 / UTF-8 字节模式。 */
    value: string | string[];
    level?: QRCodeErrorLevel;
    minVersion?: number;
    /** 在不增大版本的前提下提升纠错等级，默认 true（与 antd 一致）。 */
    boostLevel?: boolean;
    includeMargin?: boolean;
    marginSize?: number;
    /** 绘制像素尺寸，用于图标换算。 */
    size: number;
    imageSettings?: QRCodeImageSettings;
}
export interface QRCodeMatrix {
    cells: QRCodeModules;
    margin: number;
    numCells: number;
    image: QRCodeCalculatedImage | null;
    /** 已按 excavation 挖空后的待绘制模块。 */
    cellsToDraw: QRCodeModules;
    /** 前景路径（viewBox 为 0 0 numCells numCells）。 */
    path: string;
    version: number;
}
export declare const encodeQRCode: (value: string | string[], level?: QRCodeErrorLevel, minVersion?: number, boostLevel?: boolean) => QrCode;
export declare const createQRCodeMatrix: (options: QRCodeMatrixOptions) => QRCodeMatrix;
export { Ecc as QRCodeEcc, QrCode as QRCodeEncoder, QrSegment as QRCodeSegment } from './qrcodegen';
