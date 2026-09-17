import { TreeSelectNode, TreeIndex } from './tree';
export type TreeDropPosition = -1 | 0 | 1;
export interface TreeDragInfo {
    node: TreeSelectNode;
    event?: DragEvent;
}
export interface TreeDropInfo extends TreeDragInfo {
    dragNode: TreeSelectNode;
    dragNodesKeys: Array<string | number>;
    /** -1 before, 0 inside, 1 after the target node. */
    dropPosition: TreeDropPosition;
    dropToGap: boolean;
}
export interface TreeDragConfig {
    draggable?: boolean | ((node: TreeSelectNode) => boolean);
    allowDrop?: (info: {
        dragNode: TreeSelectNode;
        dropNode: TreeSelectNode;
        dropPosition: TreeDropPosition;
    }) => boolean;
    onDragStart?: (info: TreeDragInfo) => void;
    onDragEnter?: (info: TreeDragInfo) => void;
    onDragOver?: (info: TreeDragInfo) => void;
    onDragLeave?: (info: TreeDragInfo) => void;
    onDragEnd?: (info: TreeDragInfo) => void;
    onDrop?: (info: TreeDropInfo) => void;
}
export type TreeDragIns = ReturnType<typeof createTreeDrag>;
export declare function createTreeDrag(config: TreeDragConfig, tree: {
    getNode: (key: string | number) => TreeSelectNode | undefined;
    nodeIndex: () => TreeIndex;
    isDisabled: (key: string | number) => boolean;
    expand: (key: string | number) => void;
}): {
    draggingKey: import('solid-js').SourceAccessor<string | number | undefined>;
    dropTarget: import('solid-js').SourceAccessor<{
        key: string | number;
        position: TreeDropPosition;
    } | undefined>;
    isDraggable: (key: string | number) => boolean;
    canDrop: (key: string | number, position: TreeDropPosition) => boolean;
    startDrag: (key: string | number, event?: DragEvent) => boolean;
    dragOver: (key: string | number, position: TreeDropPosition, event?: DragEvent) => boolean;
    dragLeave: (key: string | number, event?: DragEvent) => void;
    endDrag: (event?: DragEvent) => void;
    drop: (key: string | number, position: TreeDropPosition, event?: DragEvent) => boolean;
};
/** Immutable reorder helper. Tree data remains owned by the caller. */
export declare function moveTreeNode(nodes: TreeSelectNode[], source: string | number, target: string | number, position: TreeDropPosition): TreeSelectNode[];
