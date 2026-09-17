export declare const transferPanelClass: (props?: ({
    status?: "error" | "warning" | "default" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const transferRowClass: (props?: ({
    selected?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const transferActionClass = "inline-flex items-center justify-center gap-1 min-w-[32px] min-h-[28px] px-2 border border-solid border-primary rounded-sm bg-primary text-on-primary cursor-pointer hover:opacity-85 disabled:bg-on-surface/4 disabled:border-outline-variant disabled:text-on-surface/25 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";
export declare const transferCheckboxClass = "shrink-0 w-[14px] h-[14px] accent-primary cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary";
