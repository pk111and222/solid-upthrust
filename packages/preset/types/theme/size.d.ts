export interface SizeTokens {
    controlHeight: string;
    controlHeightSM: string;
    controlHeightLG: string;
    fontSize: string;
    fontSizeSM: string;
    fontSizeLG: string;
    fontSizeHeading1: string;
    fontSizeHeading2: string;
    fontSizeHeading3: string;
    fontSizeHeading4: string;
    fontSizeHeading5: string;
    lineHeight: string;
    paddingXXS: string;
    paddingXS: string;
    paddingSM: string;
    padding: string;
    paddingLG: string;
    paddingXL: string;
}
export declare function createSizeTokens(overrides?: Partial<SizeTokens>): SizeTokens;
