export type TagVariant = 'filled' | 'solid' | 'outlined';
export interface TagColorInput {
    color?: string;
    variant?: TagVariant;
    /** @deprecated antd 6 起用 variant="filled" 代替 bordered={false}。 */
    bordered?: boolean;
}
export interface TagColorState {
    variant: TagVariant;
    /** 去掉 -inverse 后的颜色；solid 且未设颜色时为 'default'。 */
    color: string | undefined;
    isPreset: boolean;
    isStatus: boolean;
    /** 自定义颜色的内联样式；预设/状态色为空对象。 */
    customStyle: Record<string, string>;
}
/**
 * antd useColor 的浅色背景：保持色相/饱和度，把 HSL 亮度设为 0.95。
 * 无法解析的颜色（如 CSS 命名色）退回 color-mix 近似。
 */
export declare const tagLightBackground: (color: string) => string;
/** 纯函数：antd 6 useColor 的变体/颜色归一，UI 层只按结果选类或内联样式。 */
export declare const resolveTagColor: (input: TagColorInput) => TagColorState;
export interface TagClosableConfig {
    closeIcon?: unknown;
    'aria-label'?: string;
}
export type TagClosableState = false | {
    closeIcon: unknown;
    ariaLabel: string | undefined;
};
/**
 * antd useClosable 的判定：closable=false 或（未设 closable 且 closeIcon 为 false/null）隐藏；
 * 两者都未设置时不可关闭；closeIcon 为布尔值时使用默认图标（返回 undefined）。
 */
export declare const resolveTagClosable: (closable: boolean | TagClosableConfig | undefined, closeIcon: unknown) => TagClosableState;
export interface TagConfig {
    disabled?: boolean;
    /** 有 href 时关闭会阻止链接跳转。 */
    href?: string;
    onClose?: (event: MouseEvent) => void;
}
/** 关闭可在 onClose 中 preventDefault 取消，用于二次确认。 */
export declare const createTag: (config?: TagConfig) => {
    visible: import('solid-js').SourceAccessor<boolean>;
    close: (event: MouseEvent) => void;
};
export interface CheckableTagConfig {
    checked?: boolean;
    /** 本库扩展：antd 为完全受控，本库在未传 checked 时使用内部状态。 */
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
}
export declare const createCheckableTag: (config?: CheckableTagConfig) => {
    checked: () => boolean;
    toggle: () => void;
};
export type CheckableTagValue = string | number;
export interface CheckableTagOption<V extends CheckableTagValue = CheckableTagValue> {
    value: V;
    label: unknown;
    class?: string;
    style?: unknown;
}
export interface CheckableTagGroupConfig<V extends CheckableTagValue = CheckableTagValue> {
    multiple?: boolean;
    value?: V | V[] | null;
    defaultValue?: V | V[] | null;
    disabled?: boolean;
    onChange?: (value: any) => void;
}
/** 原始值选项归一为 { value, label }；非数组视为空。 */
export declare const normalizeCheckableTagOptions: <V extends CheckableTagValue>(options: unknown) => CheckableTagOption<V>[];
/** antd CheckableTagGroup：单选再次点击取消为 null；多选追加/移除。value !== undefined 即受控（null 也受控）。 */
export declare const createCheckableTagGroup: <V extends CheckableTagValue>(config: CheckableTagGroupConfig<V>) => {
    value: () => V | V[] | null;
    isChecked: (option: V) => boolean;
    change: (option: V, checked: boolean) => void;
};
