import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
export default function Nested() {
  return <ConfigProvider componentSize="large" componentDisabled components={{Button:{type:'primary'}}}>
    <div class="space-y-4">
      <Button>继承外层禁用</Button>
      <ConfigProvider componentSize="small" componentDisabled={false}><Button>内层小尺寸可操作</Button></ConfigProvider>
      <ConfigProvider inherit={false}><Button>重置默认属性</Button></ConfigProvider>
    </div>
  </ConfigProvider>
}
