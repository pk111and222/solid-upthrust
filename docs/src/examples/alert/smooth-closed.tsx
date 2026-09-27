import { Show, createSignal } from 'solid-js'
import Alert from 'upthrust-ui/source/Alert'
import Switch from 'upthrust-ui/source/Switch'

export default function SmoothClosed() {
  const [visible, setVisible] = createSignal(true)
  return <>
    <Show when={visible()}>
      <Alert title="Alert Message Text" type="success" closable={{ closeIcon: true, afterClose: () => setVisible(false) }} />
    </Show>
    <p>click the close button to see the effect</p>
    <Switch aria-label="Alert visibility" onChange={setVisible} checked={visible()} disabled={visible()} />
  </>
}
