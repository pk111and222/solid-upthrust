import Menu from 'upthrust-ui/source/Menu'

export default function Extra() {
  return <Menu mode="vertical" style={{ width: '256px' }} items={[
    { key: 'profile', label: '个人资料', icon: 'i-mdi-account-outline', extra: '⌘P' },
    { key: 'billing', label: '账单', icon: 'i-mdi-credit-card-outline', extra: '⌘B' },
    { key: 'setting', label: '设置', icon: 'i-mdi-cog-outline', extra: '⌘S' },
    { type: 'divider', dashed: true },
    { key: 'logout', label: '退出登录', icon: 'i-mdi-logout', danger: true },
    { key: 'disabled', label: '禁用项', disabled: true, extra: 0 },
  ]} />
}
