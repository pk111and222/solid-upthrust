import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function CustomIcon() {
  // mask 图标本身不加 bg-*，颜色随图标区（info 为主色）。
  return <Result
    icon={<span class="i-mdi-emoticon-happy-outline inline-block" />}
    title="Great, we have done all the operations!"
    extra={<Button type="primary">Next</Button>}
  />
}
