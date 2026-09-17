export declare const tableRootClass: (props?: ({
    bordered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const tableCellClass: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    bordered?: boolean | null | undefined;
    header?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const tableActionClass = "inline-flex items-center justify-center gap-1 rounded-sm border-0 bg-transparent text-primary cursor-pointer px-2 py-1 text-[13px] hover:bg-primary/8 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed";
export declare const tableInputClass = "box-border w-full min-w-0 rounded-sm border border-solid border-outline-variant px-2 py-1 bg-surface text-on-surface focus:outline-primary disabled:opacity-50";
export declare const tableFilterIconClass = "i-mdi-filter-variant";
