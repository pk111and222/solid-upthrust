import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function Status500() {
  return <Result status="500" title="500" subTitle="Sorry, something went wrong." extra={<Button type="primary">Back Home</Button>} />
}
