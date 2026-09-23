import { SelectionIns, SelectionOption } from './selection';
import { FormFieldRule } from './formField';
/** A Select option — a SelectionOption plus rc-select extras. */
export type SelectOption = SelectionOption & {
    /** Optional group label for flat option arrays. */
    group?: string;
};
/** Nested option group, in addition to the flat SelectOption.group form. */
export type SelectOptionGroup = {
    label: string;
    options: SelectOption[];
};
export type SelectOptionEntry = SelectOption | SelectOptionGroup;
export type SelectMode = 'single' | 'multiple' | 'tags';
export type SelectLabelInValue = {
    value: string | number;
    label: string;
    [key: string]: unknown;
};
export type SelectConfig = {
    /** Controlled selected key(s). Single: one key; multiple/tags: array. */
    value?: string | number | Array<string | number>;
    defaultValue?: string | number | Array<string | number>;
    options?: SelectOptionEntry[];
    /** 'single' (default), 'multiple', or 'multiple' + free entry. */
    mode?: SelectMode;
    disabled?: boolean;
    /** Report { value, label } objects instead of raw keys. Default false. */
    labelInValue?: boolean;
    /** Show the clear (×) button when non-empty. Default false. */
    allowClear?: boolean;
    /** Enable the search input. Default false. */
    showSearch?: boolean;
    /**
     * Filter predicate (antd signature). `false` disables client filtering
     * (server-side search). Default: substring match on label
     * (case-insensitive).
     */
    filterOption?: ((input: string, option: SelectOption) => boolean) | false;
    /** Controlled open state (composed with the UI's trigger). */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Fires on every keystroke in the search input (antd onSearch). */
    onSearch?: (value: string) => void;
    onClear?: () => void;
    onSelect?: (value: string | number, option: SelectOption) => void;
    onDeselect?: (value: string | number, option: SelectOption) => void;
    onChange?: (value: SelectChangeValue) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type SelectChangeValue = string | number | Array<string | number> | SelectLabelInValue | Array<SelectLabelInValue> | undefined;
export type SelectConfigFull = SelectConfig;
export type SelectIns = {
    /** The effective selected keys (array form internally). */
    value: () => Array<string | number>;
    /** Single mode: the selected key or undefined. Multiple: n/a (use value). */
    singleValue: () => string | number | undefined;
    /** The selected options in full (label lookup included). */
    selectedOptions: () => SelectOption[];
    /** The change value in the API shape (raw keys or labelInValue objects). */
    changeValue: () => SelectChangeValue;
    /** True when multiple/tags mode. */
    isMultiple: () => boolean;
    /** True when tags mode (free entry). */
    isTags: () => boolean;
    options: () => SelectOption[];
    /** Options after the current search filter (group headers collapsed in). */
    filteredOptions: () => SelectOption[];
    /** The current search text. */
    searchValue: () => string;
    /** Replace the search buffer (typing); fires onSearch. */
    setSearchValue: (text: string) => void;
    /** The keyboard-active option key (arrow navigation highlight). */
    activeKey: () => string | number | undefined;
    /** Move the active option by delta (wraps; skips disabled). */
    moveActive: (delta: number) => void;
    /** Point the active option at a specific key (hover). */
    setActiveKey: (key: string | number) => void;
    /** Reset active to the natural anchor (first filtered, else selected). */
    resetActive: () => void;
    /** Open state (composed with the UI trigger's open). */
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    /** Commit the active option (Enter). Single mode also closes. */
    commitActive: () => void;
    /** Pick an option (click). Single mode closes; multiple toggles. */
    selectOption: (key: string | number) => void;
    /** Remove one key from a multiple selection (tag ×). */
    deselectOption: (key: string | number) => void;
    /** Clear the entire selection (allowClear ×). */
    clear: () => void;
    /** Tags mode: commit the current search text as a new option. */
    commitSearchAsTag: () => void;
    isSelected: (key: string | number) => boolean;
    isDisabled: (key: string | number) => boolean;
    /** The whole widget's disabled gate. */
    isWidgetDisabled: () => boolean;
    /** The shared selection store (advanced composition). */
    store: () => SelectionIns;
};
export declare const createSelect: (config?: SelectConfigFull) => SelectIns;
export declare const selectSplits: (keyof SelectConfigFull)[];
