import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500';
export interface ResultProps {
    /** Status drives the built-in icon and tint; page codes render a wordmark. */
    status?: ResultStatus;
    title?: JSX.Element;
    subTitle?: JSX.Element;
    /** Custom icon replaces the built-in one. */
    icon?: JSX.Element;
    /** Action area, usually buttons. */
    extra?: JSX.Element;
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Result: Component<ResultProps>;
export default Result;
