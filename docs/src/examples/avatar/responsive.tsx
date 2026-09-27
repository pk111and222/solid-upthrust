import Avatar, { AvatarGroup } from 'upthrust-ui/source/Avatar'
export default function Responsive() {
  const size = { xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }
  return <div class="flex flex-wrap items-center gap-6"><Avatar class="responsive-avatar" size={size}>R</Avatar><AvatarGroup size={size}><Avatar>A</Avatar><Avatar>B</Avatar></AvatarGroup><AvatarGroup size={40}><Avatar size={{ xs: 24, md: 64 }}>C</Avatar></AvatarGroup></div>
}
