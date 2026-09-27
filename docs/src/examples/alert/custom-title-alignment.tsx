import Alert, { type AlertProps } from 'upthrust-ui/source/Alert'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'

const title = 'Long alert title wraps to multiple lines when the alert container is narrow enough.'

const titleLineHeight = 22
const iconSize = 14
const closeIconSize = 12
const smallButtonHeight = 24

const firstLineStyles: AlertProps['styles'] = {
  root: { 'align-items': 'flex-start' },
  icon: { 'margin-block-start': `${(titleLineHeight - iconSize) / 2}px` },
  actions: { 'margin-block-start': `${(titleLineHeight - smallButtonHeight) / 2}px` },
  close: { 'margin-block-start': `${(titleLineHeight - closeIconSize) / 2}px` },
}

export default function CustomTitleAlignment() {
  return <Flex vertical gap="middle" style={{ width: '360px' }}>
    <Alert title={title} type="info" showIcon closable styles={firstLineStyles} />
    <Alert title={title} type="success" showIcon closable styles={firstLineStyles} action={<Button size="small" type="text">Action</Button>} />
  </Flex>
}
