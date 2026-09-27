import Watermark from 'upthrust-ui/source/Watermark'
import { WATERMARK_IMAGE } from './image-src'

export default function ImageWatermark() {
  return <Watermark height={30} width={130} image={WATERMARK_IMAGE}>
    <div style={{ height: '500px' }} />
  </Watermark>
}
