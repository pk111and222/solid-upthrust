/**
 * Headless logic for Watermark — antd 6 `components/watermark` 的纯逻辑移植：
 * 字体合并、多行内容展开、canvas 字体串、偏移换算出的水印层样式，以及
 * useClips 的旋转 + 交错平铺绘制（canvas 由调用方的 document 创建，无 JSX / 样式）。
 */
export interface WatermarkFont {
    color?: string;
    fontSize?: number | string;
    fontWeight?: 'normal' | 'lighter' | 'bold' | 'bolder' | number;
    fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
    fontFamily?: string;
    textAlign?: CanvasTextAlign;
}
export interface WatermarkText {
    text: string;
    font?: WatermarkFont;
}
export type WatermarkContent = string | WatermarkText;
export interface WatermarkContentLine {
    text: string;
    font: Required<WatermarkFont>;
}
export type WatermarkConfig = {
    zIndex?: number;
    rotate?: number;
    width?: number;
    height?: number;
    image?: string;
    content?: WatermarkContent | WatermarkContent[];
    font?: WatermarkFont;
    gap?: [number, number];
    offset?: [number, number];
};
/** antd 默认：colorFill、fontSizeLG、zIndexPopupBase - 1。 */
export declare const WATERMARK_DEFAULT_FONT: Required<WatermarkFont>;
export declare const WATERMARK_DEFAULT_Z_INDEX = 999;
export declare const WATERMARK_DEFAULT_GAP = 100;
export declare const WATERMARK_FONT_GAP = 3;
export declare const mergeWatermarkFont: (font?: WatermarkFont) => Required<WatermarkFont>;
export declare const getWatermarkFontSize: (font: Required<WatermarkFont>, ratio?: number) => number;
export declare const getWatermarkCanvasFont: (font: Required<WatermarkFont>, ratio?: number, lineHeight?: number) => string;
/** 内容展开为行：字符串沿用全局字体，`{ text, font }` 与全局字体合并；空值跳过（toList skipEmpty）。 */
export declare const getWatermarkContentLines: (content: WatermarkContent | WatermarkContent[] | undefined, font: Required<WatermarkFont>) => WatermarkContentLine[];
/** 水印层样式：offset 超出 gap/2 的部分转为 left/top 位移并收缩宽高，其余进 background-position。 */
export declare const getWatermarkMarkStyle: (zIndex: number, gap: [number, number], offset?: [number, number]) => Record<string, string | number>;
/** 单个水印尺寸：图片默认 120×64；文字按测量宽度与字高累加（行间 3px）；无内容为 0。 */
export declare const getWatermarkMarkSize: (ctx: Pick<CanvasRenderingContext2D, "font" | "measureText"> | null, lines: WatermarkContentLine[], image?: string, width?: number, height?: number) => [number, number];
/** 旋转后内容矩形的包围盒（以中心为原点）。 */
export declare const getWatermarkRotatedBounds: (width: number, height: number, rotate: number) => {
    left: number;
    top: number;
    width: number;
    height: number;
};
/**
 * antd useClips：绘制内容 → 旋转 → 裁出包围盒 → 交错平铺（一列 + 右侧上下半格错位两份）。
 * 返回 [dataURL, 平铺宽, 平铺高]（CSS 像素）。
 */
export declare const drawWatermarkClips: (doc: Document, content: WatermarkContentLine[] | HTMLImageElement, rotate: number, ratio: number, width: number, height: number, gapX: number, gapY: number) => [string, number, number];
/** 被移除的节点或被改属性的节点是水印元素时需要重绘（antd reRendering）。 */
export declare const watermarkNeedsRerender: (mutation: MutationRecord, isWatermark: (node: Node) => boolean) => boolean;
export declare const createWatermark: (config?: WatermarkConfig) => {
    font: import('solid-js').SourceAccessor<Required<WatermarkFont>>;
    lines: import('solid-js').SourceAccessor<WatermarkContentLine[]>;
    gap: import('solid-js').SourceAccessor<[number, number]>;
    zIndex: () => number;
    rotate: () => number;
    markStyle: import('solid-js').SourceAccessor<Record<string, string | number>>;
};
export declare const watermarkSplits: (keyof WatermarkConfig)[];
