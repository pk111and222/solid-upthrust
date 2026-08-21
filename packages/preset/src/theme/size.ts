export interface SizeTokens {
  controlHeight: string
  controlHeightSM: string
  controlHeightLG: string
  fontSize: string
  fontSizeSM: string
  fontSizeLG: string
  fontSizeHeading1: string
  fontSizeHeading2: string
  fontSizeHeading3: string
  fontSizeHeading4: string
  fontSizeHeading5: string
  lineHeight: string
  paddingXXS: string
  paddingXS: string
  paddingSM: string
  padding: string
  paddingLG: string
  paddingXL: string
}

const DEFAULT_SIZE_TOKENS: SizeTokens = {
  controlHeight: '32px',
  controlHeightSM: '24px',
  controlHeightLG: '40px',
  fontSize: '14px',
  fontSizeSM: '12px',
  fontSizeLG: '16px',
  fontSizeHeading1: '38px',
  fontSizeHeading2: '30px',
  fontSizeHeading3: '24px',
  fontSizeHeading4: '20px',
  fontSizeHeading5: '16px',
  lineHeight: '1.5714',
  paddingXXS: '4px',
  paddingXS: '8px',
  paddingSM: '12px',
  padding: '16px',
  paddingLG: '24px',
  paddingXL: '32px',
}

export function createSizeTokens(overrides?: Partial<SizeTokens>): SizeTokens {
  return { ...DEFAULT_SIZE_TOKENS, ...overrides }
}
