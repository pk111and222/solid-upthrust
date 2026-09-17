export type TransferKey = string | number;
export type TransferDirection = 'left' | 'right';
export interface TransferItem {
    key: TransferKey;
    title: string;
    description?: string;
    disabled?: boolean;
}
export interface TransferConfig<T extends TransferItem = TransferItem> {
    dataSource?: T[];
    targetKeys?: TransferKey[];
    defaultTargetKeys?: TransferKey[];
    selectedKeys?: TransferKey[];
    defaultSelectedKeys?: TransferKey[];
    disabled?: boolean;
    oneWay?: boolean;
    filterOption?: (input: string, item: T) => boolean;
    onChange?: (targetKeys: TransferKey[], direction: TransferDirection, moveKeys: TransferKey[]) => void;
    onSelectChange?: (sourceSelectedKeys: TransferKey[], targetSelectedKeys: TransferKey[]) => void;
    onSearch?: (direction: TransferDirection, value: string) => void;
}
/** Target membership and temporary selection are separate controlled stores. */
export declare const createTransfer: <T extends TransferItem = TransferItem>(config?: TransferConfig<T>) => {
    targetKeys: () => TransferKey[];
    selectedKeys: () => TransferKey[];
    items: (direction: TransferDirection) => T[];
    filteredItems: (direction: TransferDirection) => T[];
    searchValue: (direction: TransferDirection) => string;
    setSearch: (direction: TransferDirection, value: string) => void;
    isDisabled: (key: TransferKey) => boolean;
    isSelected: (key: TransferKey) => boolean;
    selectedIn: (direction: TransferDirection) => TransferKey[];
    toggleSelect: (key: TransferKey) => void;
    selectionState: (direction: TransferDirection) => {
        checked: boolean;
        indeterminate: boolean;
        disabled: boolean;
    };
    selectAll: (direction: TransferDirection, checked: boolean) => void;
    movableKeys: (direction: TransferDirection) => TransferKey[];
    move: (direction: TransferDirection) => void;
    remove: (key: TransferKey) => void;
};
