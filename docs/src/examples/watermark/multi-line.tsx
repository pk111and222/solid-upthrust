import Watermark from 'upthrust-ui/source/Watermark'

export default function MultiLine() {
  return <Watermark content={['Ant Design', { text: 'Happy Working', font: { fontSize: 12 } }]}>
    <div style={{ height: '500px' }} />
  </Watermark>
}
