import { createSignal, onCleanup } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Spin from 'upthrust-ui/source/Spin'

export default function Fullscreen() {
  const [spinning, setSpinning] = createSignal(false)
  const [percent, setPercent] = createSignal(0)
  let interval: ReturnType<typeof setInterval> | undefined
  onCleanup(() => clearInterval(interval))
  const showLoader = () => {
    setSpinning(true)
    let ptg = -10
    interval = setInterval(() => {
      ptg += 5
      setPercent(ptg)
      if (ptg > 120) {
        clearInterval(interval)
        setSpinning(false)
        setPercent(0)
      }
    }, 100)
  }
  return <>
    <Button onClick={showLoader}>Show fullscreen</Button>
    <Spin spinning={spinning()} percent={percent()} fullscreen />
  </>
}
