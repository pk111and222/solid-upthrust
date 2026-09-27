/**
 * Solid 2.0.0-rc.0 的 insertExpression 在唯一动态子节点首次插入数字 0 时什么也不渲染
 * （`<span>{signal()}</span>` 中 0 被丢弃，字符串 '0' 正常）。把已解析的数字转成字符串再插入。
 */
export const numberToText = <T>(value: T): T | string =>
  typeof value === 'number' ? String(value) : Array.isArray(value) ? value.map(numberToText) as T : value
