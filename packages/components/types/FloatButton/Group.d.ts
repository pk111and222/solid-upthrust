import { JSX } from '@solidjs/web';
import { FloatButtonDirection, FloatButtonGroupPlacement, FloatButtonGroupTrigger } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
import { FloatButtonProps } from './FloatButton';
import { FloatButtonShape } from './context';
export interface FloatButtonGroupSemanticClassNames {
    root?: string;
    list?: string;
    item?: string;
    itemIcon?: string;
    itemContent?: string;
    trigger?: string;
    triggerIcon?: string;
    triggerContent?: string;
}
export interface FloatButtonGroupSemanticStyles {
    root?: JSX.CSSProperties;
    list?: JSX.CSSProperties;
    item?: JSX.CSSProperties;
    itemIcon?: JSX.CSSProperties;
    itemContent?: JSX.CSSProperties;
    trigger?: JSX.CSSProperties;
    triggerIcon?: JSX.CSSProperties;
    triggerContent?: JSX.CSSProperties;
}
export interface FloatButtonGroupSemanticInfo {
    props: FloatButtonGroupProps;
}
export interface FloatButtonGroupProps extends Omit<FloatButtonProps, 'classNames' | 'styles' | 'shape' | 'children'> {
    /** 子按钮形状，默认 circle（各自独立 + 间距 16）；square 时合并为紧凑列表。 */
    shape?: FloatButtonShape;
    /** 菜单模式的触发方式；不设置时直接平铺子按钮。 */
    trigger?: FloatButtonGroupTrigger;
    /** 受控展开（需配合 trigger）。 */
    open?: boolean;
    /** 非受控初始展开（本库保留）。 */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** 菜单展开方向，默认 top。 */
    placement?: FloatButtonGroupPlacement;
    /** @deprecated 使用 `placement`（up → top、down → bottom）。 */
    direction?: FloatButtonDirection;
    /** 触发按钮图标，默认 FileTextOutlined。 */
    icon?: JSX.Element;
    /** 展开时触发按钮的图标，默认 CloseOutlined。 */
    closeIcon?: JSX.Element;
    classNames?: SemanticInput<FloatButtonGroupSemanticClassNames, FloatButtonGroupSemanticInfo>;
    styles?: SemanticInput<FloatButtonGroupSemanticStyles, FloatButtonGroupSemanticInfo>;
    children?: JSX.Element;
}
/**
 * FloatButton.Group — antd 6 FloatButtonGroup：根节点 fixed 在右下角。
 *  - 无 trigger：直接平铺 list（circle = Flex gap 16，各自带阴影；square = Space.Compact，list 带阴影与 8px 圆角）
 *  - trigger 'click' | 'hover'：菜单模式，list 绝对定位在触发按钮 56px 外，从 ±40px + 透明度 0 过渡进出；
 *    click 模式点击触发按钮切换、document 捕获阶段点击组外关闭；hover 模式根节点移入移出开合。
 * 子按钮通过 GroupContext 继承 shape / 紧凑布局 / item* 语义化，触发按钮继承 trigger* 语义化。
 */
declare const FloatButtonGroup: (rawProps: FloatButtonGroupProps) => JSX.Element;
export default FloatButtonGroup;
