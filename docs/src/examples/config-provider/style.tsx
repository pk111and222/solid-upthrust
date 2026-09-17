import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
export default function ExternalStyle() {
  return <ConfigProvider class="rounded-lg p-4 bg-slate-50" style={{'--upthrust-colors-primary':'212 107 8','--upthrust-colors-on-primary':'255 255 255'}}>
    <Button type="primary">外部变量配色</Button>
  </ConfigProvider>
}
