import Timeline from 'upthrust-ui/source/Timeline'

export default function Semantic() {
  return <Timeline
    items={[
      { content: 'Create a services site 2015-09-01' },
      {
        content: 'Solve initial network problems 2015-09-01',
        styles: { root: { height: '100px' }, rail: { 'border-style': 'dashed' } },
      },
      {
        content: '...for a long time...',
        styles: { root: { height: '100px' }, rail: { 'border-style': 'dashed' }, content: { opacity: 0.45 } },
      },
      { content: 'Technical testing 2015-09-01' },
      { content: 'Network problems being solved 2015-09-01' },
    ]}
  />
}
