import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
export default function Fragment() {
  return <div class="flex items-center gap-3">
    <ConfigProvider wrapper={false} componentSize="small" components={{Button:{type:'primary'}}}>
      <Button>直接子元素 A</Button>
      <Button>直接子元素 B</Button>
    </ConfigProvider>
  </div>
}
