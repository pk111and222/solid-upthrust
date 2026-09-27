import Timeline from 'upthrust-ui/source/Timeline'

const clock = () => <span class="i-mdi-clock-outline inline-block text-[16px]" />

export default function Alternate() {
  return <Timeline
    mode="alternate"
    items={[
      { content: 'Create a services site 2015-09-01' },
      { content: 'Solve initial network problems 2015-09-01', color: 'green' },
      {
        icon: clock(),
        content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      },
      { color: 'red', content: 'Network problems being solved 2015-09-01' },
      { content: 'Create a services site 2015-09-01' },
      { icon: clock(), content: 'Technical testing 2015-09-01' },
    ]}
  />
}
