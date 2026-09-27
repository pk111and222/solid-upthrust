import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function Info() {
  return <Result title="Your operation has been executed" extra={<Button type="primary">Go Console</Button>} />
}
