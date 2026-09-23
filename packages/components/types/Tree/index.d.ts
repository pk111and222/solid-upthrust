import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TreeConfig, TreeIns, TreeSelectNode } from 'upthrust-competence';
export type { TreeSelectNode as TreeNode };
export { moveTreeNode } from 'upthrust-competence';
export type { TreeDropInfo, TreeDragInfo, TreeDropPosition } from 'upthrust-competence';
export interface TreeProps extends TreeConfig {
    /** Standalone Tree defaults to selection without checkboxes. */
    checkable?: boolean;
    showLine?: boolean;
    showIcon?: boolean;
    indent?: number;
    showSearch?: boolean;
    searchValue?: string;
    onSearch?: (value: string) => void;
    searchPlaceholder?: string;
    titleRender?: (node: TreeSelectNode) => JSX.Element;
    icon?: (node: TreeSelectNode, expanded: boolean) => JSX.Element;
    notFoundContent?: JSX.Element;
    'aria-label'?: string;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (el: HTMLDivElement) => void;
}
declare const Tree: Component<TreeProps>;
export declare const TreeInPanel: Component<{
    machine: TreeIns;
    treeId?: string;
    multiple?: boolean;
    indent?: number;
    virtual?: boolean;
    listHeight?: number;
    listItemHeight?: number;
    onPick?: (key: string | number) => void;
    showLine?: boolean;
    showIcon?: boolean;
    icon?: TreeProps['icon'];
    titleRender?: TreeProps['titleRender'];
}>;
export default Tree;
