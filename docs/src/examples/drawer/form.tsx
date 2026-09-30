import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Input from 'upthrust-ui/source/Input'
import Space from 'upthrust-ui/source/Space'

export default function FormInDrawer() {
  const [open, setOpen] = createSignal(false)
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>New account</Button>
    <Drawer
      title="Create a new account"
      size={720}
      onClose={() => setOpen(false)}
      open={open()}
      styles={{ body: { 'padding-bottom': '80px' } }}
      extra={<Space>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={() => setOpen(false)} type="primary">Submit</Button>
      </Space>}
    >
      <Form layout="vertical">
        <FormItem name="name" label="Name" rules={[{ required: true, message: 'Please enter user name' }]}>
          <Input placeholder="Please enter user name" />
        </FormItem>
        <FormItem name="url" label="Url" rules={[{ required: true, message: 'Please enter url' }]}>
          <Input prefix="http://" suffix=".com" placeholder="Please enter url" />
        </FormItem>
      </Form>
    </Drawer>
  </>
}
