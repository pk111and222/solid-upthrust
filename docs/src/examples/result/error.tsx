import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'
import { Paragraph, Text } from 'upthrust-ui/source/Typography'

export default function ErrorResult() {
  const icon = <span class="i-mdi-close-circle-outline inline-block align-[-0.125em] me-[8px] text-error" />
  return <Result
    status="error"
    title="Submission Failed"
    subTitle="Please check and modify the following information before resubmitting."
    extra={[<Button type="primary">Go Console</Button>, <Button>Buy Again</Button>]}
  >
    <div class="desc">
      <Paragraph><Text strong style={{ 'font-size': '16px' }}>The content you submitted has the following error:</Text></Paragraph>
      <Paragraph>{icon}Your account has been frozen. <a class="text-primary">Thaw immediately &gt;</a></Paragraph>
      <Paragraph><span class="i-mdi-close-circle-outline inline-block align-[-0.125em] me-[8px] text-error" />Your account is not yet eligible to apply. <a class="text-primary">Apply Unlock &gt;</a></Paragraph>
    </div>
  </Result>
}
