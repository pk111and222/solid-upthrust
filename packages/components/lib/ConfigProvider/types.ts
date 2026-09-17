import type { TimeRangePickerProps as TimeRangePickerConfigProps } from '../TimePicker/RangePicker'
import type { RangePickerProps as DateRangePickerConfigProps } from '../DatePicker/RangePicker'
import type { SearchProps as SearchConfigProps } from '../Input/Search'
import type { PasswordProps as PasswordConfigProps } from '../Input/Password'
import type { TextAreaProps as TextAreaConfigProps } from '../Input/TextArea'
import type { RadioButtonProps as RadioButtonConfigProps } from '../Radio/index'
import type { RadioGroupProps as RadioGroupConfigProps } from '../Radio/index'
import type { CheckboxGroupProps as CheckboxGroupConfigProps } from '../Checkbox/index'
import type { JSX } from '@solidjs/web'
import type { SizeType } from '../../common/type'
import type { ButtonProps } from '../Button'
import type { InputProps } from '../Input'
import type { InputNumberProps } from '../InputNumber'
import type { SelectProps } from '../Select'
import type { AutoCompleteProps } from '../AutoComplete'
import type { CascaderProps } from '../Cascader'
import type { TreeSelectProps } from '../TreeSelect'
import type { DatePickerProps } from '../DatePicker'
import type { TimePickerProps } from '../TimePicker'
import type { ColorPickerProps } from '../ColorPicker'
import type { FormProps } from '../Form'
import type { CheckboxProps } from '../Checkbox'
import type { RadioProps } from '../Radio'
import type { SwitchProps } from '../Switch'
import type { SliderProps } from '../Slider'
import type { RateProps } from '../Rate'
import type { TransferProps } from '../Transfer'
import type { TreeProps } from '../Tree'
import type { UploadProps } from '../Upload'
import type { MentionsProps } from '../Mentions'
import type { SegmentedProps } from '../Segmented'
import type { PaginationProps } from '../Pagination'
import type { TableProps } from '../Table'
import type { ListProps } from '../List'
import type { CardProps } from '../Card'
import type { DescriptionsProps } from '../Descriptions'
import type { PopoverProps } from '../Popover'
import type { TooltipProps } from '../Tooltip'
import type { ModalProps } from '../Modal'
import type { DrawerProps } from '../Drawer'
import type { TourProps } from '../Tour'
import type { TabsProps } from '../Tabs'
import type { SpinProps } from '../Spin'
type DefaultKeys = 'size' | 'disabled' | 'variant' | 'color' | 'type' | 'shape' | 'block' | 'ghost' | 'allowClear' | 'showCount' | 'placeholder' | 'placement' | 'trigger' | 'keyboard' | 'closable' | 'maskClosable' | 'showSkip' | 'showIndicators' | 'width' | 'zIndex' | 'gap' | 'radius' | 'bordered' | 'virtual' | 'pagination' | 'showHeader' | 'stripe' | 'rowHoverable' | 'layout' | 'labelAlign' | 'labelWidth' | 'labelWrap' | 'requiredMark' | 'colon' | 'validateTrigger' | 'preserve' | 'clearOnDestroy' | 'fullscreen' | 'format' | 'showTime' | 'showToday' | 'showNow' | 'showSearch' | 'searchPlaceholder' | 'filterOption' | 'maxTagCount' | 'notFoundContent' | 'loading' | 'tip' | 'delay'
type Defaults<T> = Partial<Pick<T, Extract<keyof T, DefaultKeys>>>
export interface ComponentDefaults {
  TimeRangePicker?: Defaults<TimeRangePickerConfigProps>
  DateRangePicker?: Defaults<DateRangePickerConfigProps>
  Search?: Defaults<SearchConfigProps>
  Password?: Defaults<PasswordConfigProps>
  TextArea?: Defaults<TextAreaConfigProps>
  RadioButton?: Defaults<RadioButtonConfigProps>
  RadioGroup?: Defaults<RadioGroupConfigProps>
  CheckboxGroup?: Defaults<CheckboxGroupConfigProps>
  Button?: Defaults<ButtonProps>
  Input?: Defaults<InputProps>
  InputNumber?: Defaults<InputNumberProps>
  Select?: Defaults<SelectProps>
  AutoComplete?: Defaults<AutoCompleteProps>
  Cascader?: Defaults<CascaderProps>
  TreeSelect?: Defaults<TreeSelectProps>
  DatePicker?: Defaults<DatePickerProps>
  TimePicker?: Defaults<TimePickerProps>
  ColorPicker?: Defaults<ColorPickerProps>
  Form?: Defaults<FormProps>
  Checkbox?: Defaults<CheckboxProps>
  Radio?: Defaults<RadioProps>
  Switch?: Defaults<SwitchProps>
  Slider?: Defaults<SliderProps>
  Rate?: Defaults<RateProps>
  Transfer?: Defaults<TransferProps>
  Tree?: Defaults<TreeProps>
  Upload?: Defaults<UploadProps>
  Mentions?: Defaults<MentionsProps>
  Segmented?: Defaults<SegmentedProps>
  Pagination?: Defaults<PaginationProps>
  Table?: Defaults<TableProps<unknown>>
  List?: Defaults<ListProps>
  Card?: Defaults<CardProps>
  Descriptions?: Defaults<DescriptionsProps>
  Popover?: Defaults<PopoverProps>
  Tooltip?: Defaults<TooltipProps>
  Modal?: Defaults<ModalProps>
  Drawer?: Defaults<DrawerProps>
  Tour?: Defaults<TourProps>
  Tabs?: Defaults<TabsProps>
  Spin?: Defaults<SpinProps>
}
export type ConfigComponentName = keyof ComponentDefaults
export interface ConfigTheme {
  /** Palette tokens accept hex/rgb/hsl colors; camelCase and kebab-case keys are supported. */
  colors?: Record<string, string>
  /** Must match the external preset prefix. Default --upthrust. */
  prefix?: string
}
interface ConfigProviderBaseProps {
  children?: JSX.Element
  componentSize?: SizeType
  componentDisabled?: boolean
  components?: ComponentDefaults
  /** Reset inherited component defaults. CSS still follows normal DOM inheritance. */
  inherit?: boolean
}
/** Scoped mode owns a theme/portal container; fragment mode only provides defaults. */
export type ConfigProviderProps = ConfigProviderBaseProps & (
  | { wrapper?: true; theme?: ConfigTheme; class?: string; style?: JSX.CSSProperties }
  | { wrapper: false; theme?: never; class?: never; style?: never }
)
