import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SelectChangeValue, SelectOption, SelectOptionEntry, SelectOptionGroup, SelectLabelInValue } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type { SelectOption, SelectOptionEntry, SelectOptionGroup, SelectLabelInValue, SelectChangeValue };
export interface SelectProps {
    virtual?: boolean;
    listHeight?: number;
    listItemHeight?: number;
    /** Controlled selected value: single key or (multiple) array of keys. */
    value?: string | number | Array<string | number>;
    defaultValue?: string | number | Array<string | number>;
    options?: SelectOptionEntry[];
    /** 'multiple' adds tags; 'tags' also allows free entry via search. */
    mode?: 'multiple' | 'tags';
    disabled?: boolean;
    /** Report { value, label } objects instead of raw keys. */
    labelInValue?: boolean;
    /** Show the clear (×) button when non-empty. */
    allowClear?: boolean;
    /** Enable the search input. Default: on for tags mode, off otherwise. */
    showSearch?: boolean;
    /** (input, option) => boolean; false disables client filtering. */
    filterOption?: ((input: string, option: SelectOption) => boolean) | false;
    placeholder?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    /** Max rendered tags before collapsing into "+N …". */
    maxTagCount?: number;
    /** Text of the collapsed counter (antd maxTagPlaceholder). */
    maxTagPlaceholder?: (omitted: SelectOption[]) => JSX.Element;
    /** Controlled dropdown open. */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    loading?: boolean;
    /** Custom dropdown content; replaces the option list. */
    dropdownRender?: (menu: JSX.Element) => JSX.Element;
    /** Empty-state text. Default "无数据". */
    notFoundContent?: string;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    name?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: SelectChangeValue) => void;
    onSearch?: (value: string) => void;
    onSelect?: (value: string | number, option: SelectOption) => void;
    onDeselect?: (value: string | number, option: SelectOption) => void;
    onClear?: () => void;
    ref?: (el: HTMLDivElement) => void;
}
/**
 * Select — the antd-style picker.
 *
 * COMPOSITION (the architecture the selection module was built for):
 *  - createSelect (headless): the option store rides the SHARED
 *    createSelection — single mode is maxSelect:1 (radio semantics),
 *    multiple/tags is unlimited (checkbox semantics) — plus search,
 *    active-option keyboard nav and tags free-entry.
 *  - createTrigger (headless): the dropdown layer — portal positioning,
 *    viewport flip, outside-click + Escape dismiss. The same machine under
 *    Dropdown/Popover/Tooltip.
 *  - this layer: the selector box (single label / tag list), the inline
 *    search input, and the portal listbox.
 */
declare const Select: Component<SelectProps>;
export default Select;
