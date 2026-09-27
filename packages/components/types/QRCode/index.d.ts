import { JSX } from '@solidjs/web';
import { QRCodeErrorLevel } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';
export type QRCodeErrorCorrectionLevel = QRCodeErrorLevel;
export type QRCodeType = 'canvas' | 'svg';
export interface QRCodeLocale {
    expired?: string;
    refresh?: string;
    scanned?: string;
}
export interface QRCodeStatusRenderInfo {
    status: Exclude<QRCodeStatus, 'active'>;
    locale: QRCodeLocale;
    onRefresh?: () => void;
}
export interface QRCodeSemanticClassNames {
    root?: string;
    cover?: string;
}
export interface QRCodeSemanticStyles {
    root?: JSX.CSSProperties;
    cover?: JSX.CSSProperties;
}
export interface QRCodeSemanticInfo {
    props: QRCodeProps;
}
export interface QRCodeProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'color' | 'children' | 'class' | 'style'> {
    /** 编码内容；数组时按分段编码。为空时不渲染。 */
    value: string | string[];
    /** 渲染方式，默认 'canvas'。 */
    type?: QRCodeType;
    /** 中心图标地址。 */
    icon?: string;
    /** 图标尺寸，默认 40。 */
    iconSize?: number | {
        width: number;
        height: number;
    };
    /** 尺寸（px），默认 160。 */
    size?: number;
    /** 前景色，默认文字色 rgba(0, 0, 0, 0.88)。 */
    color?: string;
    /** 背景色，默认 transparent。 */
    bgColor?: string;
    bordered?: boolean;
    /** 纠错等级，默认 'M'。 */
    errorLevel?: QRCodeErrorCorrectionLevel;
    /** 不增大版本时自动提升纠错等级，默认 true。 */
    boostLevel?: boolean;
    /** 静区模块数，默认 0。 */
    marginSize?: number;
    status?: QRCodeStatus;
    /** 过期状态点击刷新的回调；未提供时不显示刷新按钮。 */
    onRefresh?: () => void;
    /** 自定义遮罩内容。 */
    statusRender?: (info: QRCodeStatusRenderInfo) => JSX.Element;
    /** 覆盖内置文案（默认中文）。 */
    locale?: QRCodeLocale;
    classNames?: SemanticInput<QRCodeSemanticClassNames, QRCodeSemanticInfo>;
    styles?: SemanticInput<QRCodeSemanticStyles, QRCodeSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const QRCode: (rawProps: QRCodeProps) => JSX.Element;
export default QRCode;
