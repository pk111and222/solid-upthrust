import Timeline from 'upthrust-ui/source/Timeline'

export default function End() {
  return <Timeline
    mode="end"
    items={[
      { content: 'Create a services site 2015-09-01' },
      { content: 'Solve initial network problems 2015-09-01' },
      { icon: <span class="i-mdi-clock-outline inline-block" />, color: 'red', content: 'Technical testing 2015-09-01' },
      { content: 'Network problems being solved 2015-09-01' },
    ]}
  />
}
