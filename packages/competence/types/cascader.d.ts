import { SelectionIns } from './selection';
import { FormFieldRule } from './formField';
export type CascaderOption = {
    value: string | number;
    label: string;
    disabled?: boolean;
    /** Loading placeholder for async children (antd). */
    loading?: boolean;
    children?: CascaderOption[];
    [key: string]: unknown;
};
export type CascaderMode = 'single' | 'multiple';
export type CascaderConfig = {
    /** Controlled value: a path (single) or an array of paths (multiple). */
    value?: Array<string | number> | Array<Array<string | number>>;
    defaultValue?: Array<string | number> | Array<Array<string | number>>;
    options?: CascaderOption[];
    mode?: CascaderMode;
    disabled?: boolean;
    /** Commit on every level click, not just leaves. Default false. */
    changeOnSelect?: boolean;
    /** Enable the search box. Default false. */
    showSearch?: boolean;
    /** (input, path, nodes) => boolean; false disables client filtering. */
    searchFilterOption?: ((input: string, path: Array<string | number>, nodes: CascaderOption[]) => boolean) | false;
    /** Multiple mode with parent↔children linkage. Default false. */
    checkable?: boolean;
    /** Fire on every intermediate click (informational; antd onChange). */
    onChange?: (value: Array<string | number> | Array<Array<string | number>> | undefined, nodes: CascaderOption[]) => void;
    /** Fires on each level click regardless of changeOnSelect (antd onSelect). */
    onSelect?: (path: Array<string | number>, nodes: CascaderOption[]) => void;
    onSearch?: (value: string) => void;
    onClear?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type CascaderIns = {
    /** The selected path(s) — raw key arrays (single: one path). */
    value: () => Array<Array<string | number>>;
    /** Single mode: the selected path (or undefined). */
    path: () => Array<string | number> | undefined;
    /** The selected node chains (labels live here). */
    selectedNodes: () => CascaderOption[][];
    /** Display text: the joined label path (single). */
    labelText: () => string | undefined;
    isMultiple: () => boolean;
    isCheckable: () => boolean;
    options: () => CascaderOption[];
    /** The value→node index (rebuilt when options change). */
    nodeIndex: () => Map<string | number, {
        node: CascaderOption;
        parent?: CascaderOption;
        trail: Array<string | number>;
    }>;
    getNode: (value: string | number) => CascaderOption | undefined;
    /** The option arrays along a trail — one per menu column. */
    trailOptions: (trail?: Array<string | number>) => CascaderOption[][];
    /** The label path for a value trail. */
    labelPath: (trail: Array<string | number>) => string[];
    /** Is the trail's final node a leaf (no children)? */
    isLeaf: (trail: Array<string | number>) => boolean;
    /** Click/hover a row: extends the active trail (and may commit). */
    activate: (trail: Array<string | number>, event?: 'click' | 'hover') => void;
    /** The active trail — drives the menu columns. */
    activeTrail: () => Array<string | number>;
    /** Point the active trail directly (UI layer / external control). */
    setActiveTrail: (trail: Array<string | number>) => void;
    /** Commit a trail per changeOnSelect (called by activate). */
    commitTrail: (trail: Array<string | number>) => void;
    /** Multiple: toggle a trail's check state with full linkage. */
    toggleCheck: (trail: Array<string | number>) => void;
    /** Multiple: derived parent state — 'checked' | 'indeterminate' | 'unchecked'. */
    parentState: (trail: Array<string | number>) => 'checked' | 'indeterminate' | 'unchecked';
    /** Search text + flattened matching paths (label match, ancestors kept). */
    searchValue: () => string;
    setSearchValue: (text: string) => void;
    clearSearch: () => void;
    /** [{ path, nodes }] for every node whose path matches the filter. */
    searchMatches: () => Array<{
        path: Array<string | number>;
        nodes: CascaderOption[];
    }>;
    clear: () => void;
    isSelected: (trail: Array<string | number>) => boolean;
    isDisabled: (value: string | number) => boolean;
    isWidgetDisabled: () => boolean;
    /** The shared selection store (advanced composition). */
    store: () => SelectionIns;
};
export declare const createCascader: (config?: CascaderConfig) => CascaderIns;
export declare const cascaderSplits: (keyof CascaderConfig)[];
