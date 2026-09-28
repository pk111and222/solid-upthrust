// @unocss-include
import type { MenuItemType } from 'upthrust-ui/source/Menu'

/** 多个示例共用的侧边导航数据（对应 antd 示例的 Navigation One / Two / Three）。 */
export const sideItems: MenuItemType[] = [
  { key: 'sub1', label: '导航一', icon: 'i-mdi-email-outline', children: [
    { key: 'g1', label: '分组 1', type: 'group', children: [
      { key: '1', label: '选项 1' },
      { key: '2', label: '选项 2' },
    ] },
    { key: 'g2', label: '分组 2', type: 'group', children: [
      { key: '3', label: '选项 3' },
      { key: '4', label: '选项 4' },
    ] },
  ] },
  { key: 'sub2', label: '导航二', icon: 'i-mdi-apps', children: [
    { key: '5', label: '选项 5' },
    { key: '6', label: '选项 6' },
    { key: 'sub3', label: '子菜单', children: [
      { key: '7', label: '选项 7' },
      { key: '8', label: '选项 8' },
    ] },
  ] },
  { type: 'divider' },
  { key: 'sub4', label: '导航三', icon: 'i-mdi-cog-outline', children: [
    { key: '9', label: '选项 9' },
    { key: '10', label: '选项 10' },
    { key: '11', label: '选项 11' },
    { key: '12', label: '选项 12' },
  ] },
  { key: 'grp', label: '分组', type: 'group', children: [
    { key: '13', label: '选项 13' },
    { key: '14', label: '选项 14' },
  ] },
]

/** 顶部导航数据。 */
export const topItems: MenuItemType[] = [
  { key: 'mail', label: '导航一', icon: 'i-mdi-email-outline' },
  { key: 'app', label: '导航二', icon: 'i-mdi-apps', disabled: true },
  { key: 'SubMenu', label: '导航三 - 子菜单', icon: 'i-mdi-cog-outline', children: [
    { type: 'group', label: '分组 1', children: [
      { key: 'setting:1', label: '选项 1' },
      { key: 'setting:2', label: '选项 2' },
    ] },
    { type: 'group', label: '分组 2', children: [
      { key: 'setting:3', label: '选项 3' },
      { key: 'setting:4', label: '选项 4' },
    ] },
  ] },
  { key: 'link', label: '导航四 - 链接' },
]

/** 收起示例数据：一级项都带图标。 */
export const collapseItems: MenuItemType[] = [
  { key: '1', icon: 'i-mdi-chart-pie', label: '选项 1' },
  { key: '2', icon: 'i-mdi-monitor', label: '选项 2' },
  { key: '3', icon: 'i-mdi-archive-outline', label: '选项 3' },
  { key: 'sub1', label: '导航一', icon: 'i-mdi-email-outline', children: [
    { key: '5', label: '选项 5' },
    { key: '6', label: '选项 6' },
    { key: '7', label: '选项 7' },
    { key: '8', label: '选项 8' },
  ] },
  { key: 'sub2', label: '导航二', icon: 'i-mdi-apps', children: [
    { key: '9', label: '选项 9' },
    { key: '10', label: '选项 10' },
    { key: 'sub3', label: '子菜单', children: [
      { key: '11', label: '选项 11' },
      { key: '12', label: '选项 12' },
    ] },
  ] },
]
