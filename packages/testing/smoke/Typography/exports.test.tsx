import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
import Typography, { Text, Title, Paragraph, Link, type TypographyBaseProps } from '../../../components/lib/Typography'
const props: Public.TypographyBaseProps = { strong: true } satisfies TypographyBaseProps
const PublicTypography: typeof Public.Typography = Typography
// 命名空间和具名导出引用一致，所有公开子组件能真实挂载和卸载。
it('[typography.exports] mounts every public component', () => {
  expect([PublicTypography.Text, PublicTypography.Title, PublicTypography.Paragraph, PublicTypography.Link]).toEqual([Text, Title, Paragraph, Link])
  const view = mount(() => <><Text {...props}>text</Text><Title>title</Title><Paragraph>paragraph</Paragraph><Link href="/">link</Link></>)
  try { expect(view.host.children).toHaveLength(4); expect(view.host.querySelector('strong')?.textContent).toBe('text') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
