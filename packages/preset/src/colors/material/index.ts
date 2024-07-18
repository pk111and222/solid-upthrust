// 
import { argbFromHex, themeFromSourceColor, applyTheme, customColor } from "@material/material-color-utilities";
import type { Theme, CustomColor } from "@material/material-color-utilities";

/**
 * created function by https://m3.material.io/styles/color/roles
 * @param sourceColor not Primary Colors
 * @returns 
 */

export const materColorsGenerate = (sourceColor: string, customColor?: CustomColor[]) => {
  const color = argbFromHex(sourceColor);
  const theme = themeFromSourceColor(color, customColor);
  return {
    light: theme.schemes.dark,
    dark: theme.schemes.light,
  }
}

export const transferToUnocssTheme = (theme: Theme, isDark?: boolean) => {
  const dark = isDark || false
  return {
    
  }
}
