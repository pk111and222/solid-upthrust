import { JSX } from '@solidjs/web';
/** 栅格数值：数字或数字字符串（与 antd ColSpanType 一致），无法解析的值被忽略。 */
export type ColSpanType = number | string;
/** 某个断点下的列配置对象。 */
export interface ColSize {
    span?: ColSpanType;
    offset?: ColSpanType;
    push?: ColSpanType;
    pull?: ColSpanType;
    order?: ColSpanType;
    flex?: number | string;
}
/** 断点层：xs 没有媒体查询，与基础 props 合并为 base 层。 */
export declare const BREAKPOINT_LAYERS: readonly ["sm", "md", "lg", "xl", "xxl", "xxxl"];
export type ColBreakpoint = 'xs' | (typeof BREAKPOINT_LAYERS)[number];
/**
 * antd parseFlex：数字 n → `n n auto`；带单位的长度 → `0 0 长度`；
 * auto → `1 1 auto`；其余（none、完整简写、纯数字字符串）原样透传。
 */
export declare const parseFlex: (flex: number | string) => string;
export type ColLayoutInput = ColSize & Partial<Record<ColBreakpoint, ColSpanType | ColSize>>;
export type ColLayout = {
    /** 静态类名（均来自 styles.ts 的字面量表）。 */
    classes: string[];
    /** 与类名配对的内联 CSS 变量。 */
    vars: JSX.CSSProperties;
    /** base 层是否写了 max-width（此时去掉默认 max-w-full）。 */
    hasBaseMaxWidth: boolean;
};
/**
 * 把 span/offset/push/pull/order 与 xs…xxxl 拆成 base + 6 个断点层。
 * 每个字段只有在本元素写了对应变量时才挂消费它的类——自定义属性会继承，
 * 若依赖 var() 回退，嵌套列会读到父列的变量。
 */
export declare const colLayout: (input: ColLayoutInput) => ColLayout;
/** 间距单值：数字或 CSS 长度字符串（纯数字字符串按数字处理）。 */
export type GutterValue = number | string;
/** 水平间距取半（sign=-1 用于 Row 负外边距，sign=1 用于 Col 内边距）。 */
export declare const halfGutter: (value: GutterValue | undefined, sign: 1 | -1) => string | undefined;
/** 垂直间距写 row-gap。 */
export declare const rowGap: (value: GutterValue | undefined) => string | undefined;
