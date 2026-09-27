import Alert from 'upthrust-ui/source/Alert'

const onClose = (e: MouseEvent) => {
  console.log(e, 'I was closed.')
}

export default function Closable() {
  return <>
    <Alert title="Warning Title" type="warning" closable={{ closeIcon: true, onClose, 'aria-label': 'close' }} />
    <br />
    <Alert title="Success Title" type="success" closable={{ closeIcon: true, onClose, 'aria-label': 'close' }} />
    <br />
    <Alert title="Info Title" type="info" closable={{ closeIcon: true, onClose, 'aria-label': 'close' }} />
    <br />
    <Alert title="Error Title" type="error" closable={{ closeIcon: true, onClose, 'aria-label': 'close' }} />
  </>
}
