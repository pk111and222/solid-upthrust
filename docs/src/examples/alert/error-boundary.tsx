import { createSignal } from 'solid-js'
import Alert from 'upthrust-ui/source/Alert'
import Button from 'upthrust-ui/source/Button'

const { ErrorBoundary } = Alert

function ThrowError() {
  const [error, setError] = createSignal<Error>()
  return <>
    {(() => {
      const current = error()
      if (current) throw current
      return <Button danger onClick={() => setError(new Error('An Uncaught Error'))}>Click to throw an error</Button>
    })()}
  </>
}

export default function ErrorBoundaryDemo() {
  return <ErrorBoundary>
    <ThrowError />
  </ErrorBoundary>
}
