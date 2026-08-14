import { Component, JSX } from 'solid-js';

interface TypographyBaseProps {
    type?: 'secondary' | 'success' | 'warning' | 'danger';
    strong?: boolean;
    italic?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    mark?: boolean;
    keyboard?: boolean;
    disabled?: boolean;
    ellipsis?: boolean | {
        rows?: number;
    };
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface TextProps extends TypographyBaseProps {
}
export interface TitleProps extends TypographyBaseProps {
    level?: 1 | 2 | 3 | 4 | 5;
}
export interface ParagraphProps extends TypographyBaseProps {
}
export interface LinkProps extends TypographyBaseProps {
    href?: string;
    target?: HTMLAnchorElement['target'];
    rel?: string;
}
export declare const Text: Component<TextProps>;
export declare const Title: Component<TitleProps>;
export declare const Paragraph: Component<ParagraphProps>;
export declare const Link: Component<LinkProps>;
declare const Typography: {
    Text: Component<TextProps>;
    Title: Component<TitleProps>;
    Paragraph: Component<ParagraphProps>;
    Link: Component<LinkProps>;
};
export default Typography;
