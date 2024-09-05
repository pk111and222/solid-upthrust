import { getMaterialColorWithSync, ContrastLevelType, VariantType } from 'solid-material-color'

export interface MaterialColorOptions {
  color: string,
  contrastLevel?: ContrastLevelType
  variant?: VariantType
}

export function getMaterialColor(option: MaterialColorOptions) {
  const drakSchema = getMaterialColorWithSync(option.color, {
    contrastLevel: option.contrastLevel || 'default',
    variant: option.variant || 'content',
    isDark: true
  })
  const lightSchema =  getMaterialColorWithSync(option.color, {
    contrastLevel: option.contrastLevel || 'default',
    variant: option.variant || 'content',
    isDark: false
  })
  return {dark: drakSchema, light: lightSchema}
}

