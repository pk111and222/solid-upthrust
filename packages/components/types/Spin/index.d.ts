import { JSX } from '@solidjs/web';
import { SemanticInput } from '../../common/semantic';
import { SizeType } from '../../common/type';
export interface SpinSemanticClassNames {
    root?: string;
    section?: string;
    indicator?: string;
    description?: string;
    container?: string;
    /** @deprecated Use description. */
    tip?: string;
    /** @deprecated Use root. */
    mask?: string;
}
export interface SpinSemanticStyles {
    root?: JSX.CSSProperties;
    section?: JSX.CSSProperties;
    indicator?: JSX.CSSProperties;
    description?: JSX.CSSProperties;
    container?: JSX.CSSProperties;
    /** @deprecated Use description. */
    tip?: JSX.CSSProperties;
    /** @deprecated Use root. */
    mask?: JSX.CSSProperties;
}
export interface SpinSemanticInfo {
    props: SpinProps;
}
/** A node, or a factory so one indicator can be rendered by many Spins at once. */
export type SpinIndicator = JSX.Element | (() => JSX.Element);
export interface SpinProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
    /** Loading state. Default true (a bare <Spin /> spins). */
    spinning?: boolean;
    /** Delay before the spinner appears, ms (prevents flashing); hiding is immediate. */
    delay?: number;
    size?: SizeType;
    /** Description under the indicator. */
    description?: JSX.Element;
    /** @deprecated Use description. */
    tip?: JSX.Element;
    /** Custom indicator; sized by the Spin size (1em icons fit). */
    indicator?: SpinIndicator;
    /** Fullscreen backdrop loader. */
    fullscreen?: boolean;
    /** Progress 0–100; 'auto' estimates a progress that never finishes. */
    percent?: number | 'auto';
    /** Nested mode: children get a dimmed overlay while spinning. */
    children?: JSX.Element;
    /** @deprecated Use classNames.root. */
    wrapperClass?: string;
    rootClass?: string;
    class?: string;
    style?: JSX.CSSProperties;
    classNames?: SemanticInput<SpinSemanticClassNames, SpinSemanticInfo>;
    styles?: SemanticInput<SpinSemanticStyles, SpinSemanticInfo>;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}
export declare const nextAutoPercent: (prev: number) => number;
declare const Spin: ((providedProps: SpinProps) => JSX.Element) & {
    setDefaultIndicator: (indicator: SpinIndicator | undefined) => void;
};
export default Spin;
