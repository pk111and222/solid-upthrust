import { JSX } from '@solidjs/web';
export interface VirtualListProps<T> {
    items: readonly T[];
    virtual?: boolean;
    height?: number;
    itemHeight?: number;
    activeIndex?: number;
    class?: string;
    role?: JSX.HTMLAttributes<HTMLDivElement>['role'];
    children: (item: T, index: () => number) => JSX.Element;
}
export default function VirtualList<T>(props: VirtualListProps<T>): JSX.Element;
