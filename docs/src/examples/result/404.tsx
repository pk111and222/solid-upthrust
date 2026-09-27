import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function Status404() {
  return <Result status="404" title="404" subTitle="Sorry, the page you visited does not exist." extra={<Button type="primary">Back Home</Button>} />
}
