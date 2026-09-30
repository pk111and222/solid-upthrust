import { JSX } from '@solidjs/web';
import { SemanticInput } from '../../common/semantic';
import { BadgeProps } from '../Badge';
import { TooltipProps } from '../Tooltip';
import { FloatButtonSemanticClassNames, FloatButtonSemanticStyles, FloatButtonShape, FloatButtonType } from './context';
/** antd FloatButtonBadgeProps：Badge 去掉 status / text / title / children。 */
export type FloatButtonBadgeProps = Omit<BadgeProps, 'status' | 'text' | 'title' | 'children'>;
/** tooltip 传节点即 title，传对象即 Tooltip 属性（antd convertToTooltipProps）。 */
export type FloatButtonTooltipProps = Omit<TooltipProps, 'children' | 'ref' | 'class' | 'style'>;
export interface FloatButtonSemanticInfo {
    props: FloatButtonProps;
}
export interface FloatButtonProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'style' | 'children' | 'onClick' | 'ref' | 'content'> {
    /** 按钮类型，默认 default。 */
    type?: FloatButtonType;
    /** 按钮形状，默认 circle；在 Group 内由 Group 的 shape 决定。 */
    shape?: FloatButtonShape;
    /** 图标；icon 与 content 都未设置时显示 FileTextOutlined。 */
    icon?: JSX.Element;
    /** 文字内容（建议配合 square 形状）。 */
    content?: JSX.Element;
    /** @deprecated 使用 `content`。 */
    description?: JSX.Element;
    /** 气泡提示：节点即标题，对象即 Tooltip 属性。 */
    tooltip?: JSX.Element | FloatButtonTooltipProps;
    /** 链接地址，设置后渲染为 `<a>`。 */
    href?: string;
    /** 链接打开方式（同 `<a target>`）。 */
    target?: string;
    /** 徽标（Badge 属性，不含 status / text / title / children）。 */
    badge?: FloatButtonBadgeProps;
    /** 原生 button type，默认 button。 */
    htmlType?: 'button' | 'submit' | 'reset';
    'aria-label'?: string;
    disabled?: boolean;
    onClick?: (e: MouseEvent) => void;
    classNames?: SemanticInput<FloatButtonSemanticClassNames, FloatButtonSemanticInfo>;
    styles?: SemanticInput<FloatButtonSemanticStyles, FloatButtonSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
    /** 根节点（button / a）。 */
    ref?: (el: HTMLElement) => void;
}
/**
 * FloatButton — antd 6 FloatButton：size=large 的 Button 纵向排布（40 宽、最小 40 高），
 * 单独使用时 fixed 在右下角（right 24 / bottom 48 / z 1000 / boxShadowSecondary）；
 * 在 Group 内由 GroupContext 覆盖 shape，并决定各自带阴影（circle）还是并入 Compact（square）。
 * tooltip 直接把 trigger 绑在按钮本身上，不额外包一层 div（否则会破坏 fixed / Compact 的首尾圆角）。
 */
declare const FloatButton: (rawProps: FloatButtonProps) => JSX.Element;
export default FloatButton;
