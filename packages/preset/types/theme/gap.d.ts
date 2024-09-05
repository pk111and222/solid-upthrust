export type GapTheme = {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
};
export declare function createGapTheme(size?: string | number, customLogic?: (value: string | number) => GapTheme): GapTheme;
export declare function generateSizeLevels(base: string | number): GapTheme;
