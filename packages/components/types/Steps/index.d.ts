import { Component, JSX } from 'solid-js';
import { StepItem, StepStatus } from 'upthrust-competence';

export interface StepsProps {
    current?: number;
    status?: StepStatus;
    items: StepItem[];
    direction?: 'horizontal' | 'vertical';
    size?: 'default' | 'small';
    onChange?: (current: number) => void;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Steps: Component<StepsProps>;
export default Steps;
