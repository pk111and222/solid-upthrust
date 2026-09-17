import { TimeRangePickerProps as TimeRangePickerConfigProps } from '../TimePicker/RangePicker';
import { RangePickerProps as DateRangePickerConfigProps } from '../DatePicker/RangePicker';
import { SearchProps as SearchConfigProps } from '../Input/Search';
import { PasswordProps as PasswordConfigProps } from '../Input/Password';
import { TextAreaProps as TextAreaConfigProps } from '../Input/TextArea';
import { RadioButtonProps as RadioButtonConfigProps, RadioGroupProps as RadioGroupConfigProps } from '../Radio/index';
import { CheckboxGroupProps as CheckboxGroupConfigProps } from '../Checkbox/index';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
import { ButtonProps } from '../Button';
import { InputProps } from '../Input';
import { InputNumberProps } from '../InputNumber';
import { SelectProps } from '../Select';
import { AutoCompleteProps } from '../AutoComplete';
import { CascaderProps } from '../Cascader';
import { TreeSelectProps } from '../TreeSelect';
import { DatePickerProps } from '../DatePicker';
import { TimePickerProps } from '../TimePicker';
import { ColorPickerProps } from '../ColorPicker';
import { FormProps } from '../Form';
import { CheckboxProps } from '../Checkbox';
import { RadioProps } from '../Radio';
import { SwitchProps } from '../Switch';
import { SliderProps } from '../Slider';
import { RateProps } from '../Rate';
import { TransferProps } from '../Transfer';
import { TreeProps } from '../Tree';
import { UploadProps } from '../Upload';
import { MentionsProps } from '../Mentions';
import { SegmentedProps } from '../Segmented';
import { PaginationProps } from '../Pagination';
import { TableProps } from '../Table';
import { ListProps } from '../List';
import { CardProps } from '../Card';
import { DescriptionsProps } from '../Descriptions';
import { PopoverProps } from '../Popover';
import { TooltipProps } from '../Tooltip';
import { ModalProps } from '../Modal';
import { DrawerProps } from '../Drawer';
import { TourProps } from '../Tour';
import { TabsProps } from '../Tabs';
import { SpinProps } from '../Spin';
type DefaultKeys = 'size' | 'disabled' | 'variant' | 'color' | 'type' | 'shape' | 'block' | 'ghost' | 'allowClear' | 'showCount' | 'placeholder' | 'placement' | 'trigger' | 'keyboard' | 'closable' | 'maskClosable' | 'showSkip' | 'showIndicators' | 'width' | 'zIndex' | 'gap' | 'radius' | 'bordered' | 'virtual' | 'pagination' | 'showHeader' | 'stripe' | 'rowHoverable' | 'layout' | 'labelAlign' | 'labelWidth' | 'labelWrap' | 'requiredMark' | 'colon' | 'validateTrigger' | 'preserve' | 'clearOnDestroy' | 'fullscreen' | 'format' | 'showTime' | 'showToday' | 'showNow' | 'showSearch' | 'searchPlaceholder' | 'filterOption' | 'maxTagCount' | 'notFoundContent' | 'loading' | 'tip' | 'delay';
type Defaults<T> = Partial<Pick<T, Extract<keyof T, DefaultKeys>>>;
export interface ComponentDefaults {
    TimeRangePicker?: Defaults<TimeRangePickerConfigProps>;
    DateRangePicker?: Defaults<DateRangePickerConfigProps>;
    Search?: Defaults<SearchConfigProps>;
    Password?: Defaults<PasswordConfigProps>;
    TextArea?: Defaults<TextAreaConfigProps>;
    RadioButton?: Defaults<RadioButtonConfigProps>;
    RadioGroup?: Defaults<RadioGroupConfigProps>;
    CheckboxGroup?: Defaults<CheckboxGroupConfigProps>;
    Button?: Defaults<ButtonProps>;
    Input?: Defaults<InputProps>;
    InputNumber?: Defaults<InputNumberProps>;
    Select?: Defaults<SelectProps>;
    AutoComplete?: Defaults<AutoCompleteProps>;
    Cascader?: Defaults<CascaderProps>;
    TreeSelect?: Defaults<TreeSelectProps>;
    DatePicker?: Defaults<DatePickerProps>;
    TimePicker?: Defaults<TimePickerProps>;
    ColorPicker?: Defaults<ColorPickerProps>;
    Form?: Defaults<FormProps>;
    Checkbox?: Defaults<CheckboxProps>;
    Radio?: Defaults<RadioProps>;
    Switch?: Defaults<SwitchProps>;
    Slider?: Defaults<SliderProps>;
    Rate?: Defaults<RateProps>;
    Transfer?: Defaults<TransferProps>;
    Tree?: Defaults<TreeProps>;
    Upload?: Defaults<UploadProps>;
    Mentions?: Defaults<MentionsProps>;
    Segmented?: Defaults<SegmentedProps>;
    Pagination?: Defaults<PaginationProps>;
    Table?: Defaults<TableProps<unknown>>;
    List?: Defaults<ListProps>;
    Card?: Defaults<CardProps>;
    Descriptions?: Defaults<DescriptionsProps>;
    Popover?: Defaults<PopoverProps>;
    Tooltip?: Defaults<TooltipProps>;
    Modal?: Defaults<ModalProps>;
    Drawer?: Defaults<DrawerProps>;
    Tour?: Defaults<TourProps>;
    Tabs?: Defaults<TabsProps>;
    Spin?: Defaults<SpinProps>;
}
export type ConfigComponentName = keyof ComponentDefaults;
export interface ConfigTheme {
    /** Palette tokens accept hex/rgb/hsl colors; camelCase and kebab-case keys are supported. */
    colors?: Record<string, string>;
    /** Must match the external preset prefix. Default --upthrust. */
    prefix?: string;
}
interface ConfigProviderBaseProps {
    children?: JSX.Element;
    componentSize?: SizeType;
    componentDisabled?: boolean;
    components?: ComponentDefaults;
    /** Reset inherited component defaults. CSS still follows normal DOM inheritance. */
    inherit?: boolean;
}
/** Scoped mode owns a theme/portal container; fragment mode only provides defaults. */
export type ConfigProviderProps = ConfigProviderBaseProps & ({
    wrapper?: true;
    theme?: ConfigTheme;
    class?: string;
    style?: JSX.CSSProperties;
} | {
    wrapper: false;
    theme?: never;
    class?: never;
    style?: never;
});
export {};
