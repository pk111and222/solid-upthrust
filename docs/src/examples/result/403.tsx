import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function Status403() {
  return <Result status="403" title="403" subTitle="Sorry, you are not authorized to access this page." extra={<Button type="primary">Back Home</Button>} />
}
