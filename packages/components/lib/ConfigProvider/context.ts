import { createContext, useContext, merge } from 'solid-js'
import type { SizeType } from '../../common/type'
import { FormItemContext } from '../Input/context'
import { FormContext } from '../Form/context'
import type { ComponentDefaults, ConfigComponentName } from './types'
export interface ConfigContextValue {
  componentSize: () => SizeType | undefined
  componentDisabled: () => boolean | undefined
  defaults: () => ComponentDefaults
  element: () => HTMLElement | undefined
}
export const ConfigContext = createContext<ConfigContextValue | null>(null)
export const useConfig = () => useContext(ConfigContext)
const sized = new Set<string>(['Button', 'Input', 'TextArea', 'Password', 'Search', 'Switch', 'Table', 'InputNumber', 'Select', 'AutoComplete', 'Cascader', 'TreeSelect', 'DatePicker', 'DateRangePicker', 'TimePicker', 'TimeRangePicker', 'ColorPicker', 'Segmented', 'Form'])
const controls = new Set<string>([...sized, 'Checkbox', 'CheckboxGroup', 'Radio', 'RadioButton', 'RadioGroup', 'Switch', 'Slider', 'Rate', 'Transfer', 'Tree', 'Upload', 'Mentions'])
/** Explicit props > Form/Item defaults > component defaults > shared defaults. */
export function useComponentProps<T extends object>(name: ConfigComponentName, props: T): T {
  const config = useConfig()
  const item = useContext(FormItemContext), form = useContext(FormContext)
  // merge uses a lazy source so reactive provider updates are not snapshotted.
  return merge(() => {
    const defaults = config?.defaults()[name] ?? {}
    return {
      ...defaults,
      ...(sized.has(name) ? { size: (name !== 'Form' ? item?.size() ?? form?.size() : undefined) ?? ('size' in defaults ? defaults.size : undefined) ?? config?.componentSize() } : {}),
      ...(controls.has(name) ? { disabled: (name !== 'Form' ? item?.disabled() ?? form?.disabled() : undefined) ?? ('disabled' in defaults ? defaults.disabled : undefined) ?? config?.componentDisabled() } : {}),
    }
  }, props) as T
}
