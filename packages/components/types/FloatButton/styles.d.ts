import { VariantProps } from 'class-variance-authority';
import { FloatButtonDirection } from 'upthrust-competence';
declare const floatButtonVariants: (props?: ({
    shape?: "circle" | "square" | null | undefined;
    size?: "middle" | "large" | null | undefined;
    hidden?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const floatButtonClass: (v: VariantProps<typeof floatButtonVariants>) => string;
declare const floatGroupVariants: (props?: ({
    direction?: "left" | "right" | "up" | "down" | null | undefined;
    placement?: "rt" | "rb" | "lt" | "lb" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const floatGroupClass: (v: VariantProps<typeof floatGroupVariants>) => string;
/** The fanned children wrapper — collapses via grid-rows trick (max-height
 * animation without measuring). Reversed axes must ALSO reverse the fan gap
 * direction; the transition lives on each child instead (see itemClass). */
export declare const floatGroupItemsClass: (direction: FloatButtonDirection) => string;
export declare const floatGroupItemClass: () => string;
export declare const backTopIconClass: () => string;
export declare const floatTriggerIconClass: (open: boolean) => string;
export {};
