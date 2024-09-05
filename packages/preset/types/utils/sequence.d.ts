export type Option = {
    weightRatioMap: Record<number, number>;
    stepFactor: number;
    len?: number;
    minSafety?: number;
    maxSafety?: number;
};
export declare function getSequence(value: number, option: Option): number[];
