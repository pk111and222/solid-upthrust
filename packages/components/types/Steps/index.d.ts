import { JSX } from '@solidjs/web';
import { StepStatus } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type { StepStatus } from 'upthrust-competence';
export type StepsOrientation = 'horizontal' | 'vertical';
export type StepsTitlePlacement = 'horizontal' | 'vertical';
export type StepsSize = 'default' | 'small';
export type StepsType = 'default' | 'dot';
export type StepsVariant = 'filled' | 'outlined';
/** 单个步骤。 */
export interface StepItem {
    title?: JSX.Element;
    subTitle?: JSX.Element;
    /** 步骤详情（antd 6 名称）；与 description 二选一，content 优先。 */
    content?: JSX.Element;
    /** 步骤详情（旧名称）。 */
    description?: JSX.Element;
    /** 图标类名（如 'i-mdi-account'）或任意节点；设置后替换序号圆。 */
    icon?: string | JSX.Element;
    /** 覆盖由 current 推导出的状态。 */
    status?: StepStatus;
    /** 禁止点击。 */
    disabled?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
}
export type StepsSemanticName = 'root' | 'item' | 'itemIcon' | 'itemTitle' | 'itemSubtitle' | 'itemContent' | 'itemRail';
export type StepsClassNames = Partial<Record<StepsSemanticName, string>>;
export type StepsStyles = Partial<Record<StepsSemanticName, JSX.CSSProperties>>;
export interface StepsSemanticInfo {
    props: StepsProps;
}
export interface StepsProgressDotInfo {
    index: number;
    status: StepStatus;
    title?: JSX.Element;
    content?: JSX.Element;
    description?: JSX.Element;
}
export type StepsProgressDotRender = (iconDot: JSX.Element, info: StepsProgressDotInfo) => JSX.Element;
export interface StepsProps {
    items: StepItem[];
    /** 当前步骤（以 initial 为起点计数），默认 0。 */
    current?: number;
    /** 起始序号，默认 0：影响显示编号、current 基准与 onChange 参数。 */
    initial?: number;
    /** 当前步骤的状态，默认 'process'。 */
    status?: StepStatus;
    /** 方向（antd 6 名称），优先于 direction。 */
    orientation?: StepsOrientation;
    /** 方向（旧名称），默认 'horizontal'。 */
    direction?: StepsOrientation;
    size?: StepsSize;
    /** 标题位置（仅水平方向），默认 'horizontal'（图标右侧）。 */
    titlePlacement?: StepsTitlePlacement;
    /** 标题位置（旧名称）。 */
    labelPlacement?: StepsTitlePlacement;
    /** 'dot' 为点状步骤条。 */
    type?: StepsType;
    /** 点状步骤条；传函数可自定义点的渲染。为真时等价 type="dot"。 */
    progressDot?: boolean | StepsProgressDotRender;
    /** 外观，默认 'filled'。 */
    variant?: StepsVariant;
    /** 当前步骤的进度（0–100），在当前图标外显示圆环（点状模式不显示）。 */
    percent?: number;
    /** 点击步骤回调，参数为 initial + 序号；设置后未禁用的非当前步骤可点击、可键盘操作。 */
    onChange?: (current: number) => void;
    classNames?: SemanticInput<StepsClassNames, StepsSemanticInfo>;
    styles?: SemanticInput<StepsStyles, StepsSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Steps: (rawProps: StepsProps) => JSX.Element;
export default Steps;
