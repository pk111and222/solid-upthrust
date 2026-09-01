import { VariantProps } from 'class-variance-authority';
declare const calendarRootVariants: (props?: ({
    fullscreen?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarHeaderVariants: (props?: ({
    fullscreen?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarSelectVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarModeButtonVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
    active?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarPanelVariants: (props?: import('class-variance-authority/types').ClassProp | undefined) => string;
declare const calendarWeekdayVariants: (props?: ({
    fullscreen?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarWeekdayRowVariants: (props?: ({
    layout?: "full" | "mini" | "mini-week" | "full-week" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarGridVariants: (props?: ({
    layout?: "date" | "month" | "date-week" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarFullDateVariants: (props?: ({
    state?: "disabled" | "selected" | "idle" | "prev-next" | "today" | "today-prev-next" | "selected-prev-next" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarFullDateValueVariants: (props?: ({
    selected?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarMiniDateVariants: (props?: ({
    state?: "disabled" | "selected" | "idle" | "prev-next" | "today" | "today-prev-next" | "selected-prev-next" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarFullMonthVariants: (props?: ({
    state?: "disabled" | "selected" | "idle" | "prev-next" | "today" | "today-prev-next" | "selected-prev-next" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const calendarMiniMonthVariants: (props?: ({
    state?: "disabled" | "selected" | "idle" | "prev-next" | "today" | "today-prev-next" | "selected-prev-next" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type CalendarStyleVariants = {
    fullscreen: boolean;
};
export declare const calendarRootClass: (variants: VariantProps<typeof calendarRootVariants>) => string;
export declare const calendarHeaderClass: (variants: VariantProps<typeof calendarHeaderVariants>) => string;
export declare const calendarSelectClass: (variants: VariantProps<typeof calendarSelectVariants>) => string;
export declare const calendarModeSwitchClass: () => string;
export declare const calendarModeButtonClass: (variants: VariantProps<typeof calendarModeButtonVariants>) => string;
export declare const calendarPanelClass: (variants: VariantProps<typeof calendarPanelVariants>) => string;
export declare const calendarWeekdayClass: (variants: VariantProps<typeof calendarWeekdayVariants>) => string;
export declare const calendarWeekdayRowClass: (variants: VariantProps<typeof calendarWeekdayRowVariants>) => string;
export declare const calendarWeekdayRowPlaceholderClass: () => string;
export declare const calendarGridClass: (variants: VariantProps<typeof calendarGridVariants>) => string;
export declare const calendarFullDateClass: (variants: VariantProps<typeof calendarFullDateVariants>) => string;
export declare const calendarFullDateValueClass: (variants: VariantProps<typeof calendarFullDateValueVariants>) => string;
export declare const calendarFullDateContentClass: () => string;
export declare const calendarMiniDateClass: (variants: VariantProps<typeof calendarMiniDateVariants>) => string;
export declare const calendarFullMonthClass: (variants: VariantProps<typeof calendarFullMonthVariants>) => string;
export declare const calendarMiniMonthClass: (variants: VariantProps<typeof calendarMiniMonthVariants>) => string;
export declare const calendarWeekRowClass: () => string;
export declare const CALENDAR_SELECT_ICON = "i-mdi-chevron-down";
export declare const CALENDAR_PREV_MONTH_ICON = "i-mdi-chevron-left";
export declare const CALENDAR_NEXT_MONTH_ICON = "i-mdi-chevron-right";
export {};
