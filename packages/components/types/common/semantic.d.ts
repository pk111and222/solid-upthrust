/**
 * antd 语义化 classNames / styles：既可以是对象，也可以是 `(info) => 对象`。
 * info.props 为合并默认值后的属性，函数每次读取都会重新执行，调用方应放进 memo。
 */
export type SemanticInput<T, Info> = T | ((info: Info) => T | undefined);
export declare const resolveSemantic: <T extends object, Info>(value: SemanticInput<T, Info> | undefined, info: Info) => Partial<T>;
