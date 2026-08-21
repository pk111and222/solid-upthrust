export type DropdownPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'bottom' | 'top';
export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';
export type DropdownConfig = {
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    trigger?: DropdownTrigger;
    onOpenChange?: (open: boolean) => void;
    placement?: DropdownPlacement;
};
export type DropdownIns = {
    open: () => boolean;
    setOpen: (v: boolean) => void;
    toggle: () => void;
};
export declare const createDropdown: (config?: DropdownConfig) => {
    open: import('solid-js').SourceAccessor<boolean>;
    setOpen: (v: boolean) => void;
    toggle: () => void;
    triggerRef: (el: HTMLElement) => void;
    overlayRef: (el: HTMLElement) => void;
    overlayStyle: import('solid-js').SourceAccessor<Record<string, string>>;
    refs: DropdownIns;
};
export declare const dropdownSplits: (keyof DropdownConfig)[];
