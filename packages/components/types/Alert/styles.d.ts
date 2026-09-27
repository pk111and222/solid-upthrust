export declare const alertClass: (props?: ({
    tone?: "outlined-success" | "outlined-info" | "outlined-warning" | "outlined-error" | "filled-success" | "filled-info" | "filled-warning" | "filled-error" | null | undefined;
    withDescription?: boolean | null | undefined;
    banner?: boolean | null | undefined;
    leaving?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const alertIconClass: (props?: ({
    type?: "error" | "warning" | "success" | "info" | null | undefined;
    withDescription?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const alertBuiltinIconClass = "inline-flex items-center leading-[0] align-[-0.125em] [&>svg]:inline-block";
export declare const alertSectionClass = "flex-1 min-w-0";
export declare const alertTitleClass: (props?: ({
    withDescription?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const alertDescriptionClass: (props?: ({
    type?: "error" | "warning" | "success" | "info" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const alertActionsClass = "ms-[8px]";
export declare const alertCloseClass: string;
export declare const alertCloseIconClass = "inline-flex items-center leading-[0] align-[-0.125em] [&>svg]:inline-block text-on-surface/45 hover:text-on-surface transition-colors duration-200";
