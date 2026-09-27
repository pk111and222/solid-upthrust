import Avatar from 'upthrust-ui/source/Avatar'
export default function Basic() {
  return <div class="flex flex-col gap-5">{(['circle', 'square'] as const).map(shape => <div class="flex items-center gap-4">{(['large', 'middle', 'small', 48] as const).map(size => <Avatar shape={shape} size={size}>U</Avatar>)}</div>)}</div>
}
