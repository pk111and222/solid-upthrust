import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';
export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export interface QRCodeProps {
    /** text/URL to encode */
    value: string;
    /** rendered size in px (default 160) */
    size?: number;
    /** module color */
    color?: string;
    /** background color */
    bgColor?: string;
    bordered?: boolean;
    /** error correction level; higher = more damage-tolerant but denser */
    errorLevel?: QRCodeErrorCorrectionLevel;
    /** small logo overlay in the center (autoSelect uses H) */
    icon?: string;
    iconSize?: number | {
        width: number;
        height: number;
    };
    status?: QRCodeStatus;
    /** status=loading shows this mask content */
    loadingContent?: JSX.Element;
    /** fired when the user clicks refresh in the expired mask */
    onRefresh?: (e: MouseEvent) => void;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const QRCode: Component<QRCodeProps>;
export default QRCode;
