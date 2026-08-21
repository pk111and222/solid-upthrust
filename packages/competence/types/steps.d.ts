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
    /**
     * Navigation guard for clicks (antd semantics): clicks may only move
     * BACKWARD to a finished step or stay on/step to the current one — never
     * jump forward past an unfinished step. Set false to allow free jumping.
     */
    clickNavigable?: boolean;
    /** 0-100 progress of the current step; enables the dot progress mode. */
    percent?: number;
};
export type StepsIns = {
    current: () => number;
    next: () => void;
    prev: () => void;
    reset: () => void;
};
export declare const createSteps: (config: StepsConfig) => {
    current: import('solid-js').SourceAccessor<number>;
    total: import('solid-js').SourceAccessor<number>;
    getStepStatus: (index: number) => StepStatus;
    isFinish: (index: number) => boolean;
    isProcess: (index: number) => boolean;
    isError: (index: number) => boolean;
    canGoTo: (step: number) => boolean;
    goTo: (step: number) => void;
    navigateTo: (step: number) => void;
    next: () => void;
    prev: () => void;
    reset: () => void;
    percentOf: import('solid-js').SourceAccessor<number>;
    refs: StepsIns;
};
export declare const stepsSplits: (keyof StepsConfig)[];
