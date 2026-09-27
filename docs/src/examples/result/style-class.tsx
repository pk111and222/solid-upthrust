import Button from 'upthrust-ui/source/Button'
import Result, { type ResultProps } from 'upthrust-ui/source/Result'

const classNamesObject: ResultProps['classNames'] = {
  root: 'demo-result-root',
  title: 'demo-result-title',
  subTitle: 'demo-result-subtitle',
  icon: 'demo-result-icon',
  extra: 'demo-result-extra',
  body: 'demo-result-body',
}
const classNamesFn: ResultProps['classNames'] = info => ({ root: info.props.status === 'success' ? 'demo-result-root--success' : 'demo-result-root--default' })

const stylesObject: ResultProps['styles'] = {
  root: { 'border-width': '2px', 'border-style': 'dashed', padding: '16px' },
  title: { 'font-style': 'italic', color: '#1890ff' },
  subTitle: { 'font-weight': 'bold' },
  icon: { opacity: 0.8 },
  extra: { 'background-color': '#f0f0f0', padding: '8px' },
  body: { 'background-color': '#fafafa', padding: '12px' },
}
const stylesFn: ResultProps['styles'] = info => info.props.status === 'error'
  ? { root: { 'background-color': '#fff2f0', 'border-color': '#ff4d4f' }, title: { color: '#ff4d4f' } }
  : { root: { 'background-color': '#f6ffed', 'border-color': '#52c41a' }, title: { color: '#52c41a' } }

export default function StyleClass() {
  return <>
    <Result
      status="info" title="classNames Object" subTitle="This is a subtitle"
      styles={stylesObject} classNames={classNamesObject} extra={<Button type="primary">Action</Button>}
    >
      <div>Content area</div>
    </Result>
    <Result status="success" title="classNames Function" subTitle="Dynamic class names" styles={stylesFn} classNames={classNamesFn} extra={<Button>Action</Button>} />
  </>
}
