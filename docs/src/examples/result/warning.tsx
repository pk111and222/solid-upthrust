import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function Warning() {
  return <Result status="warning" title="There are some problems with your operation." extra={<Button type="primary">Go Console</Button>} />
}
