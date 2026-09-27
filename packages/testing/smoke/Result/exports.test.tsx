import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Result, { type ResultProps } from '../../../components/lib/Result'
import { NoFound } from '../../../components/lib/Result/images'
import { mount } from '../../utils/mount'

const props: Public.ResultProps = {
  status: 404 satisfies Public.ResultExceptionStatus,
  title: '404',
  classNames: { root: 'r' } satisfies Public.ResultSemanticClassNames,
  styles: info => ({ title: { color: info.props.status === 404 ? 'red' : 'blue' } }) satisfies Public.ResultSemanticStyles,
} satisfies ResultProps
const PublicResult: typeof Public.Result = Result
// 公开入口：Result、静态异常插画与语义化类型可用；最小挂载后可清理。
it('[result.exports] mounts Result from the public entry', () => {
  expect(PublicResult.PRESENTED_IMAGE_404).toBe(NoFound)
  const status: Public.ResultStatus = 'success'
  expect(status).toBe('success')
  const view = mount(() => <PublicResult {...props} />)
  try { expect(view.host.querySelector('svg title')?.textContent).toBe('No Found') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
