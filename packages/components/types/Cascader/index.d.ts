import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { CascaderOption } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type { CascaderOption };
export interface CascaderProps {
    virtual?: boolean;
    listHeight?: number;
    listItemHeight?: number;
    /** Controlled value: a path (single) or array of paths (multiple). */
    value?: Array<string | number> | Array<Array<string | number>>;
    defaultValue?: Array<string | number> | Array<Array<string | number>>;
    options?: CascaderOption[];
    /** 'multiple' enables multi-path selection. */
    mode?: 'multiple';
    disabled?: boolean;
    /** Commit on every level click, not just leaves. */
    changeOnSelect?: boolean;
    /** Enable the search box. Default: false. */
    showSearch?: boolean;
    /** (input, path, nodes) => boolean; false disables client filtering. */
    searchFilterOption?: ((input: string, path: Array<string | number>, nodes: CascaderOption[]) => boolean) | false;
    /** multiple mode with parent↔children checkbox linkage. */
    checkable?: boolean;
    placeholder?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    /** Separator in the display text. Default ' / '. */
    separator?: string;
    /** Max rendered tags before collapsing into "+N …". */
    maxTagCount?: number;
    /** Whether the menu expands on hover (antd expandTrigger). Default click. */
    expandTrigger?: 'click' | 'hover';
    notFoundContent?: string;
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: Array<string | number> | Array<Array<string | number>> | undefined, nodes: CascaderOption[]) => void;
    onSelect?: (path: Array<string | number>, nodes: CascaderOption[]) => void;
    onSearch?: (value: string) => void;
    onClear?: () => void;
    ref?: (el: HTMLDivElement) => void;
}
/**
 * Cascader — the antd-style path picker.
 *
 * COMPOSITION: the headless createCascader rides the SHARED createSelection
 * (paths as joined keys — single = maxSelect 1, multiple = unlimited,
 * exactly Select's engine) and adds the tree model: per-level columns,
 * active trail, changeOnSelect, search flattening, and checkable
 * parent↔children linkage. The dropdown layer is createTrigger — the same
 * machine under Dropdown/Popover/Tooltip/Select. This layer renders the
 * selector box, the multi-column portal menu, and the flat search list.
 */
declare const Cascader: Component<CascaderProps>;
export default Cascader;
