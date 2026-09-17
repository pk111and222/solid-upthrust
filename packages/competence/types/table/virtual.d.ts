import { TableCell, TableConfig, TableKey, TableRow } from './types';
export interface TableVirtualRow<T> {
    row: TableRow<T>;
    index: number;
    start: number;
    size: number;
    end: number;
}
export declare function createTableVirtualizer<T>(rows: () => readonly TableRow<T>[], cells: () => readonly TableCell<T>[][], config: TableConfig<T>): {
    virtualRows: () => {
        row: TableRow<T>;
        index: number;
        start: number;
        size: number;
        end: number;
    }[];
    visibleRange: import('solid-js').SourceAccessor<[number, number]>;
    totalHeight: () => number;
    spacerPadding: () => [number, number];
    viewport: import('solid-js').SourceAccessor<number>;
    scrollTop: () => number;
    measureRow: (key: TableKey, height: number) => boolean;
    resolveScrollTo: (target: {
        key?: TableKey;
        index?: number;
        top?: number;
        align?: "start" | "center" | "end" | "nearest";
        offset?: number;
    }) => number | undefined;
    setViewport: (height: number) => void;
    setScrollTop: (top: number) => void;
    clearMeasurements: () => void;
};
