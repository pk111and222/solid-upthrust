export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepItem = {
    title: string;
    subTitle?: string;
    description?: string;
    icon?: string;
    status?: StepStatus;
    disabled?: boolean;
};
export type StepsConfig = {
    current?: number;
    items: StepItem[];
    status?: StepStatus;
    onChange?: (current: number) => void;
};
export type StepsIns = {
    current: () => number;
    next: () => void;
    prev: () => void;
    reset: () => void;
};
export declare const createSteps: (config: StepsConfig) => {
    current: import('solid-js').Accessor<number>;
    getStepStatus: (index: number) => StepStatus;
    goTo: (step: number) => void;
    next: () => void;
    prev: () => void;
    reset: () => void;
    refs: StepsIns;
};
export declare const stepsSplits: (keyof StepsConfig)[];
