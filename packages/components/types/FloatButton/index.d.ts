import { default as BackTop } from './BackTop';
import { default as FloatButtonGroup } from './Group';
export type { FloatButtonProps, FloatButtonBadgeProps, FloatButtonTooltipProps, FloatButtonSemanticInfo, } from './FloatButton';
export type { FloatButtonType, FloatButtonShape, FloatButtonSemanticClassNames, FloatButtonSemanticStyles, } from './context';
export type { BackTopProps } from './BackTop';
export type { FloatButtonGroupProps, FloatButtonGroupSemanticClassNames, FloatButtonGroupSemanticStyles, FloatButtonGroupSemanticInfo, } from './Group';
export type { FloatButtonGroupPlacement, FloatButtonGroupTrigger } from 'upthrust-competence';
export { BackTop, FloatButtonGroup as Group };
declare const FloatButtonCompound: ((rawProps: import('./FloatButton').FloatButtonProps) => import("@solidjs/web").JSX.Element) & {
    BackTop: (rawProps: import('./BackTop').BackTopProps) => import("@solidjs/web").JSX.Element;
    Group: (rawProps: import('./Group').FloatButtonGroupProps) => import("@solidjs/web").JSX.Element;
};
export default FloatButtonCompound;
