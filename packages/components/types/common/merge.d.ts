/**
 * 认识 upthrust preset 主题 token 的 twMerge。
 *
 * 默认 twMerge 不认识 preset 的间距档位与字号 token，会出现两类静默错误：
 * - `my-lg my-0` 不被视为冲突，用户的 my-0 覆盖不了默认外边距；
 * - `text-body` 被当成文字颜色，与 `text-on-surface` 互相吞掉。
 * 这里把 spacing（xxs…xl）与 text（heading-1…5、body、body-sm、body-lg）登记进主题。
 */
export declare const mergeClass: (...classLists: import('tailwind-merge').ClassNameValue[]) => string;
