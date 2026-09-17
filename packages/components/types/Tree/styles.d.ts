import { VariantProps } from 'class-variance-authority';
declare const treeRootVariants: (props?: ({
    showLine?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeRootClass: (variants: VariantProps<typeof treeRootVariants>) => string;
/** One node row (the full-width clickable strip). */
declare const treeNodeVariants: (props?: ({
    selected?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeNodeWrapClass: (variants: VariantProps<typeof treeNodeVariants>) => string;
/** The switcher slot (leaf: invisible, keeps the width for alignment). */
declare const treeSwitcherVariants: (props?: ({
    leaf?: boolean | null | undefined;
    expanded?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeSwitcherWrapClass: (variants: VariantProps<typeof treeSwitcherVariants>) => string;
/** The node label text (matched highlights in search). */
declare const treeNodeLabelVariants: (props?: ({
    matched?: boolean | null | undefined;
    selected?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeNodeLabelWrapClass: (variants: VariantProps<typeof treeNodeLabelVariants>) => string;
/** The children track — grid-rows animation (the Collapse contract). */
declare const treeChildrenVariants: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeChildrenWrapClass: (variants: VariantProps<typeof treeChildrenVariants>) => string;
/** The single grid cell inside the track (min-h-0 + overflow-hidden REQUIRED). */
export declare const treeChildrenInnerClass: () => string;
/** The checkbox (Cascader checkbox family). */
declare const treeCheckboxVariants: (props?: ({
    state?: "checked" | "indeterminate" | "unchecked" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeCheckboxWrapClass: (variants: VariantProps<typeof treeCheckboxVariants>) => string;
/** The check mark / dash inside the box. */
declare const treeCheckboxMarkVariants: (props?: ({
    state?: "checked" | "indeterminate" | "unchecked" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const treeCheckboxMarkWrapClass: (variants: VariantProps<typeof treeCheckboxMarkVariants>) => string;
/** The dropdown panel variant (used by TreeSelect) — overflow scroll slot. */
export declare const treeDropdownListClass: () => string;
export declare const TREE_SWITCHER_ICON = "i-mdi-chevron-right";
export {};
