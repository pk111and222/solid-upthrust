import { Rule } from '@unocss/core';
import { SizeTokens } from '../theme/size';
import { StyleTokens } from '../theme/style';
/**
 * Rules are built from the resolved size/style tokens so that
 * `presetUpthrust({ switchedTheme: { sizeTokens, styleTokens } })`
 * overrides propagate into every utility class below.
 */
export declare function createRules(sizeTokens: SizeTokens, styleTokens: StyleTokens): Rule[];
