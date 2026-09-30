import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Modal from 'upthrust-ui/source/Modal'

export default function Static() {
  return <Flex gap="middle" wrap>
    <Button onClick={() => Modal.info({ title: 'This is a notification message', content: <p>some messages...some messages...</p> })}>Info</Button>
    <Button onClick={() => Modal.success({ content: 'some messages...some messages...' })}>Success</Button>
    <Button onClick={() => Modal.error({ title: 'This is an error message', content: 'some messages...some messages...' })}>Error</Button>
    <Button onClick={() => Modal.warning({ title: 'This is a warning message', content: 'some messages...some messages...' })}>Warning</Button>
    <Button onClick={() => Modal.confirm({
      title: 'Do you want to delete these items?',
      content: 'When clicked the OK button, this dialog will be closed after 1 second',
      onOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    })}>Confirm</Button>
    <Button onClick={() => {
      const instance = Modal.success({ title: 'This is a notification message', content: 'This modal will be destroyed after 5 second.' })
      let seconds = 5
      const timer = setInterval(() => {
        seconds -= 1
        instance.update({ content: `This modal will be destroyed after ${seconds} second.` })
      }, 1000)
      setTimeout(() => { clearInterval(timer); instance.destroy() }, 5000)
    }}>Update and destroy</Button>
  </Flex>
}
