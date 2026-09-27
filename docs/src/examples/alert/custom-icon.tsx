import Alert from 'upthrust-ui/source/Alert'

// antd 用 SmileOutlined；这里用同形的 mdi 图标（mask 图标本身不加 bg-*，颜色随类型）。
const icon = () => <span class="i-mdi-emoticon-happy-outline inline-block align-[-0.125em]" />

export default function CustomIcon() {
  return <>
    <Alert icon={icon()} title="showIcon = false" type="success" />
    <br />
    <Alert icon={icon()} title="Success Tips" type="success" showIcon />
    <br />
    <Alert icon={icon()} title="Informational Notes" type="info" showIcon />
    <br />
    <Alert icon={icon()} title="Warning" type="warning" showIcon />
    <br />
    <Alert icon={icon()} title="Error" type="error" showIcon />
    <br />
    <Alert icon={icon()} title="Success Tips" description="Detailed description and advice about successful copywriting." type="success" showIcon />
    <br />
    <Alert icon={icon()} title="Informational Notes" description="Additional description and information about copywriting." type="info" showIcon />
    <br />
    <Alert icon={icon()} title="Warning" description="This is a warning notice about copywriting." type="warning" showIcon />
    <br />
    <Alert icon={icon()} title="Error" description="This is an error message about copywriting." type="error" showIcon />
  </>
}
