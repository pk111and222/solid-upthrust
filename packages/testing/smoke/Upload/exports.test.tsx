import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import Upload, { Dragger } from '../../../components/lib/Upload'

let dispose: (() => void) | undefined

afterEach(() => {
  dispose?.()
  dispose = undefined
  document.body.innerHTML = ''
  flush()
})

it('mounts the public Upload and Dragger components', () => {
  const host = document.createElement('div')
  document.body.append(host)
  dispose = render(() => <><Upload /><Dragger /></>, host)
  flush()

  expect(host.querySelectorAll('input[type="file"]')).toHaveLength(2)
  expect(host.querySelector('button')?.textContent).toContain('点击上传')
  expect(host.querySelector('[role="button"][aria-disabled="false"]')).not.toBeNull()
})
