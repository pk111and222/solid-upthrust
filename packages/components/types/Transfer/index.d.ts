import { JSX } from '@solidjs/web';
import { TransferConfig, TransferItem, TransferDirection } from 'upthrust-competence';
export type { TransferItem, TransferKey, TransferDirection } from 'upthrust-competence';
export interface TransferProps<T extends TransferItem = TransferItem> extends TransferConfig<T> {
    titles?: [string, string];
    operations?: [JSX.Element, JSX.Element];
    showSearch?: boolean;
    showSelectAll?: boolean;
    searchPlaceholder?: string;
    notFoundContent?: JSX.Element;
    render?: (item: T) => JSX.Element;
    footer?: (direction: TransferDirection) => JSX.Element;
    listStyle?: JSX.CSSProperties;
    status?: 'error' | 'warning';
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Transfer: <T extends TransferItem = TransferItem>(providedProps: TransferProps<T>) => JSX.Element;
export default Transfer;
