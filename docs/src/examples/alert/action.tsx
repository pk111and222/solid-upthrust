import Alert from 'upthrust-ui/source/Alert'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'

export default function Action() {
  return <>
    <Alert title="Success Tips" type="success" showIcon action={<Button size="small" type="text">UNDO</Button>} closable />
    <br />
    <Alert
      title="Error Text" showIcon description="Error Description Error Description Error Description Error Description" type="error"
      action={<Button size="small" danger>Detail</Button>}
    />
    <br />
    <Alert title="Warning Text" type="warning" action={<Button type="text" size="small">Done</Button>} closable />
    <br />
    <Alert
      title="Info Text" description="Info Description Info Description Info Description Info Description" type="info"
      action={<Flex vertical gap="small" style={{ 'min-width': '80px' }}>
        <Button size="small" type="primary" block>Accept</Button>
        <Button size="small" danger ghost block>Decline</Button>
      </Flex>}
      closable
    />
  </>
}
