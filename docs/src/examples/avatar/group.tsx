import Avatar, { AvatarGroup } from 'upthrust-ui/source/Avatar'
export default function Group() {
  return <div class="flex flex-col gap-5"><AvatarGroup><Avatar color="#f56a00">A</Avatar><Avatar color="#87d068">B</Avatar><Avatar color="#1677ff">C</Avatar><Avatar color="#722ed1">D</Avatar></AvatarGroup><AvatarGroup size={48} shape="square"><Avatar>甲</Avatar><Avatar>乙</Avatar><Avatar size={32} shape="circle" color="#f56a00">丙</Avatar></AvatarGroup></div>
}
