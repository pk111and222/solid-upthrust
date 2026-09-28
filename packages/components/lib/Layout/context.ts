import { createContext } from 'solid-js'

/** Sider 向内部内容（如 Menu）暴露的收起状态，对齐 antd SiderContext。 */
export interface SiderContextProps {
  siderCollapsed?: boolean
}

// 可选注入：不在 Sider 内时为 null（Solid 2 无 Provider 且无默认值时会抛错）。
// 独立成文件：Menu 只依赖这个 context，不把 Layout 组件代码一起打进来。
export const SiderContext = createContext<SiderContextProps | null>(null)
