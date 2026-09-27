import { JSX } from '@solidjs/web';
import { CheckableTagConfig, CheckableTagValue, PresetColor, PresetStatusColor, TagClosableConfig, TagVariant } from 'upthrust-competence';
export type { TagVariant, CheckableTagValue } from 'upthrust-competence';
export type TagSemanticName = 'root' | 'icon' | 'content' | 'close';
export type TagColor = PresetColor | `${PresetColor}-inverse` | PresetStatusColor | (string & {});
type Handler<E extends Event> = JSX.EventHandlerUnion<HTMLElement, E>;
export interface TagClosable extends Omit<TagClosableConfig, 'closeIcon'> {
    closeIcon?: JSX.Element;
}
export interface TagProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'color' | 'children' | 'class' | 'style' | 'onClick' | 'onClose'> {
    children?: JSX.Element;
    /** 预设色板（blue…gold）、状态色（success/processing/error/warning/default）或任意 CSS 颜色。 */
    color?: TagColor;
    /** 标签变体，默认 filled。 */
    variant?: TagVariant;
    /** @deprecated 使用 variant="filled"。antd 6 中 bordered 不再产生描边。 */
    bordered?: boolean;
    /** true 显示默认关闭图标；对象可设置 closeIcon 与 aria-label。 */
    closable?: boolean | TagClosable;
    /** 自定义关闭图标；未设 closable 时，传入图标即可关闭，false/null 隐藏。 */
    closeIcon?: JSX.Element | boolean | null;
    /** 关闭按钮的无障碍名称，closable 对象的 aria-label 优先。默认“关闭标签”。 */
    closeLabel?: string;
    icon?: JSX.Element;
    disabled?: boolean;
    /** 设置后渲染为 <a>。 */
    href?: string;
    target?: string;
    rel?: string;
    onClose?: (event: MouseEvent) => void;
    onClick?: Handler<MouseEvent>;
    classNames?: Partial<Record<TagSemanticName, string>>;
    styles?: Partial<Record<TagSemanticName, JSX.CSSProperties>>;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface CheckableTagProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'onChange' | 'children' | 'class' | 'style' | 'onClick' | 'onKeyDown'>, CheckableTagConfig {
    children?: JSX.Element;
    icon?: JSX.Element;
    onClick?: JSX.EventHandlerUnion<HTMLSpanElement, MouseEvent>;
    onKeyDown?: JSX.EventHandlerUnion<HTMLSpanElement, KeyboardEvent>;
    class?: string;
    style?: JSX.CSSProperties;
}
/** 与 antd 一致使用 checkbox 语义：点击或 Space 切换，Enter 不切换；禁用时移出 Tab 序列。 */
export declare const CheckableTag: (props: CheckableTagProps) => JSX.Element;
export interface CheckableTagOption<V extends CheckableTagValue = CheckableTagValue> {
    value: V;
    label: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
interface CheckableTagGroupBase<V extends CheckableTagValue> extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'class' | 'style' | 'defaultValue'> {
    /** 选项；原始值会同时作为 value 与 label。 */
    options?: (CheckableTagOption<V> | V)[];
    disabled?: boolean;
    classNames?: {
        root?: string;
        item?: string;
    };
    styles?: {
        root?: JSX.CSSProperties;
        item?: JSX.CSSProperties;
    };
    class?: string;
    style?: JSX.CSSProperties;
}
export interface CheckableTagGroupSingleProps<V extends CheckableTagValue = CheckableTagValue> extends CheckableTagGroupBase<V> {
    multiple?: false;
    value?: V | null;
    defaultValue?: V | null;
    onChange?: (value: V | null) => void;
}
export interface CheckableTagGroupMultipleProps<V extends CheckableTagValue = CheckableTagValue> extends CheckableTagGroupBase<V> {
    multiple: true;
    value?: V[];
    defaultValue?: V[];
    onChange?: (value: V[]) => void;
}
export type CheckableTagGroupProps<V extends CheckableTagValue = CheckableTagValue> = CheckableTagGroupSingleProps<V> | CheckableTagGroupMultipleProps<V>;
/** antd 6 CheckableTagGroup：单选再次点击取消为 null，多选返回数组；value 受控（含 null）。 */
export declare const CheckableTagGroup: <V extends CheckableTagValue = CheckableTagValue>(props: CheckableTagGroupProps<V>) => JSX.Element;
declare const Tag: ((props: TagProps) => JSX.Element) & {
    CheckableTag: (props: CheckableTagProps) => JSX.Element;
    CheckableTagGroup: <V extends CheckableTagValue = CheckableTagValue>(props: CheckableTagGroupProps<V>) => JSX.Element;
};
export default Tag;
