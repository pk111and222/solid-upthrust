export interface StyleTokens {
    borderRadiusXS: string;
    borderRadiusSM: string;
    borderRadius: string;
    borderRadiusLG: string;
    boxShadow: string;
    boxShadowSecondary: string;
    boxShadowTertiary: string;
    motionDurationFast: string;
    motionDurationMid: string;
    motionDurationSlow: string;
    motionEaseInOut: string;
    motionEaseOut: string;
    motionEaseIn: string;
}
export declare function createStyleTokens(overrides?: Partial<StyleTokens>): StyleTokens;
