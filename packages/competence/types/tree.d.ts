import { TreeDragConfig, TreeDragIns } from './treeDrag';
import { FormFieldRule } from './formField';
export type TreeSelectNode = {
    value: string | number;
    label: string;
    disabled?: boolean;
    /** Rows are clickable-selectable unless false (antd selectable). */
    selectable?: boolean;
    /** Rows are checkable unless false (antd checkable per node). */
    checkable?: boolean;
    children?: TreeSelectNode[];
    [key: string]: unknown;
};
export type TreeCheckState = 'checked' | 'indeterminate' | 'unchecked';
/** Depth-first walk collecting EVERY node with its path and depth. */
export declare const flattenTree: (nodes: TreeSelectNode[], parent?: TreeSelectNode, path?: Array<string | number>, level?: number) => Array<{
    node: TreeSelectNode;
    parent?: TreeSelectNode;
    path: Array<string | number>;
    level: number;
}>;
/** The value-keyed lookup (rebuilt by a memo when treeData changes). */
export type TreeIndex = Map<string | number, {
    node: TreeSelectNode;
    parent?: TreeSelectNode;
    path: Array<string | number>;
    level: number;
}>;
export declare const buildTreeIndex: (nodes: TreeSelectNode[]) => TreeIndex;
/** Every node value that has children (the expandable set). */
export declare const branchKeysOf: (nodes: TreeSelectNode[]) => Array<string | number>;
export type TreeConfig = TreeDragConfig & {
    treeData?: TreeSelectNode[];
    /** Controlled expanded keys. */
    expandedKeys?: Array<string | number>;
    defaultExpandedKeys?: Array<string | number>;
    /** Expand every branch on mount. Default false. */
    defaultExpandAll?: boolean;
    /** Controlled selected (highlighted) keys. */
    selectedKeys?: Array<string | number>;
    defaultSelectedKeys?: Array<string | number>;
    /** Controlled checked keys (checkable). */
    checkedKeys?: Array<string | number>;
    defaultCheckedKeys?: Array<string | number>;
    /** Parent↔children checkbox linkage. Default true. */
    checkable?: boolean;
    /** Rows are clickable-selected. Default true. */
    selectable?: boolean;
    multiple?: boolean;
    /** Check nodes independently without parent/child linkage. */
    checkStrictly?: boolean;
    /** Disable the whole widget. */
    disabled?: boolean;
    onExpand?: (expandedKeys: Array<string | number>, info: {
        node: TreeSelectNode;
        expanded: boolean;
    }) => void;
    onSelect?: (selectedKeys: Array<string | number>, info: {
        node: TreeSelectNode;
        selected: boolean;
    }) => void;
    onCheck?: (checkedKeys: Array<string | number>, info: {
        node: TreeSelectNode;
        checked: boolean;
    }) => void;
};
export type TreeIns = TreeDragIns & {
    treeData: () => TreeSelectNode[];
    nodeIndex: () => TreeIndex;
    getNode: (value: string | number) => TreeSelectNode | undefined;
    isDisabled: (value: string | number) => boolean;
    hasChildren: (value: string | number) => boolean;
    isSelectable: (value: string | number) => boolean;
    isCheckableNode: (value: string | number) => boolean;
    expandedKeys: () => Array<string | number>;
    isExpanded: (value: string | number) => boolean;
    expand: (value: string | number) => void;
    collapse: (value: string | number) => void;
    toggleExpand: (value: string | number) => void;
    setExpandedKeys: (keys: Array<string | number>) => void;
    selectedKeys: () => Array<string | number>;
    isSelected: (value: string | number) => boolean;
    select: (value: string | number) => void;
    checkedKeys: () => Array<string | number>;
    halfCheckedKeys: () => Array<string | number>;
    isHalfChecked: (value: string | number) => boolean;
    isChecked: (value: string | number) => boolean;
    checkState: (value: string | number) => TreeCheckState;
    toggleCheck: (value: string | number) => void;
    setCheckedKeys: (keys: Array<string | number>) => void;
    visibleKeys: () => Array<string | number>;
    activeKey: () => string | number | undefined;
    setActiveKey: (key: string | number) => void;
    navigate: (key: string) => string | number | undefined;
    searchValue: () => string;
    setSearchValue: (text: string) => void;
    searching: () => boolean;
    /**
     * The tree to RENDER: the full data normally; while searching, the tree
     * pruned to matching nodes (a node survives when IT or any descendant
     * matches) with the matched label highlighted via nodeMeta.
     */
    displayTree: () => TreeSelectNode[];
    /** value → did this node's own label match the query (for highlight). */
    matchSet: () => Set<string | number>;
    isSearching: () => boolean;
    clear: () => void;
    isWidgetDisabled: () => boolean;
};
export declare const createTree: (config?: TreeConfig) => TreeIns;
export type TreeSelectCheckStrategy = 'SHOW_PARENT' | 'SHOW_CHILD' | 'SHOW_ALL';
export type TreeSelectConfig = {
    /** Controlled value: single key (single) or key array (multiple). */
    value?: string | number | Array<string | number>;
    defaultValue?: string | number | Array<string | number>;
    treeData?: TreeSelectNode[];
    /** 'multiple' turns on the checkbox mode. */
    mode?: 'multiple';
    /** Parent↔children linkage when multiple. Default true. */
    treeCheckable?: boolean;
    /** Independent parent/child checks (no linkage). Default false. */
    treeCheckStrictly?: boolean;
    /** Which nodes the value reports: default SHOW_PARENT. */
    treeCheckStrategy?: TreeSelectCheckStrategy;
    disabled?: boolean;
    /** Controlled dropdown open. */
    open?: boolean;
    defaultOpen?: boolean;
    /** Expand every branch of the dropdown tree. Default false. */
    defaultExpandAll?: boolean;
    /** Controlled expanded keys of the dropdown tree. */
    expandedKeys?: Array<string | number>;
    onExpand?: (expandedKeys: Array<string | number>, info: {
        node: TreeSelectNode;
        expanded: boolean;
    }) => void;
    onOpenChange?: (open: boolean) => void;
    onSearch?: (value: string) => void;
    onSelect?: (value: string | number, node: TreeSelectNode) => void;
    onDeselect?: (value: string | number, node: TreeSelectNode) => void;
    onChange?: (value: string | number | Array<string | number> | undefined, nodes: TreeSelectNode | TreeSelectNode[] | undefined) => void;
    onClear?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type TreeSelectIns = {
    value: () => Array<string | number>;
    /** The selection-store keys — leaf-expanded form (pre-strategy). */
    rawChecked: () => Array<string | number>;
    singleValue: () => string | number | undefined;
    selectedNodes: () => TreeSelectNode[];
    isMultiple: () => boolean;
    /** The checkable gate (multiple mode implies it). */
    isCheckable: () => boolean;
    isStrict: () => boolean;
    /** The API-shape value after the strategy collapse. */
    changeValue: () => string | number | Array<string | number> | undefined;
    changeNodes: () => TreeSelectNode | TreeSelectNode[] | undefined;
    /** The underlying createTree engine (advanced composition). */
    tree: () => TreeIns;
    getNode: (value: string | number) => TreeSelectNode | undefined;
    labelOf: (value: string | number) => string;
    /** Pick a row (single mode): select + commit + close hint. */
    pickNode: (value: string | number) => void;
    /** Multiple: checkbox toggle with linkage (or strict toggle). */
    toggleCheck: (value: string | number) => void;
    /** Remove one key from the value (tag ×) — expands the key first. */
    removeKey: (value: string | number) => void;
    clear: () => void;
    isSelected: (value: string | number) => boolean;
    /** Search delegated to the tree. */
    searchValue: () => string;
    setSearchValue: (text: string) => void;
    /** Open state (composed with the UI trigger). */
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    isWidgetDisabled: () => boolean;
};
export declare const createTreeSelect: (config?: TreeSelectConfig) => TreeSelectIns;
export declare const treeSplits: (keyof TreeConfig)[];
export declare const treeSelectSplits: (keyof TreeSelectConfig)[];
