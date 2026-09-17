import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TreeSelectNode } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type { TreeSelectNode };
export interface TreeSelectProps {
    virtual?: boolean;
    listHeight?: number;
    listItemHeight?: number;
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
    /** Which nodes the value reports: SHOW_PARENT (default) | SHOW_CHILD | SHOW_ALL. */
    treeCheckStrategy?: 'SHOW_PARENT' | 'SHOW_CHILD' | 'SHOW_ALL';
    disabled?: boolean;
    showSearch?: boolean;
    placeholder?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    /** Max rendered tags before collapsing into "+N …". */
    maxTagCount?: number;
    /** Controlled dropdown open. */
    open?: boolean;
    defaultOpen?: boolean;
    /** Expand every branch in the dropdown tree on first open. Default false. */
    defaultExpandAll?: boolean;
    /** Controlled expanded keys of the dropdown tree. */
    expandedKeys?: Array<string | number>;
    onExpand?: (expandedKeys: Array<string | number>, info: {
        node: TreeSelectNode;
        expanded: boolean;
    }) => void;
    onOpenChange?: (open: boolean) => void;
    notFoundContent?: string;
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: string | number | Array<string | number> | undefined, nodes: TreeSelectNode | TreeSelectNode[] | undefined) => void;
    onSelect?: (value: string | number, node: TreeSelectNode) => void;
    onDeselect?: (value: string | number, node: TreeSelectNode) => void;
    onSearch?: (value: string) => void;
    onClear?: () => void;
    ref?: (el: HTMLDivElement) => void;
}
/**
 * TreeSelect — the antd-style tree picker.
 *
 * COMPOSITION: the headless createTreeSelect rides createTree (index,
 * expand, checkable linkage, search prune) and adds the picker shell:
 * single/multiple value shapes and the SHOW_PARENT strategy collapse.
 * The dropdown layer is createTrigger — the same machine under
 * Select/Cascader. This layer renders the selector box and the portal
 * panel HOSTING the shared Tree renderer (TreeInPanel) driven by the
 * picker's tree machine.
 */
declare const TreeSelect: Component<TreeSelectProps>;
export default TreeSelect;
