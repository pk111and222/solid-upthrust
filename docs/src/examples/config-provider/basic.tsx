import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
export default function Basic() {
  return <ConfigProvider components={{Button:{type:'primary'},Input:{placeholder:'请输入项目名称'}}}>
    <div class="flex items-center gap-3"><Input /><Button>创建项目</Button></div>
  </ConfigProvider>
}
