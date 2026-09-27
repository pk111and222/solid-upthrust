import Avatar from 'upthrust-ui/source/Avatar'
const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#1677ff"/><circle cx="40" cy="28" r="14" fill="white"/><path d="M14 80V68a26 26 0 0 1 52 0v12" fill="white"/></svg>')
export default function Types() {
  return <div class="flex items-center gap-4"><Avatar src={image} srcSet={`${image} 1x`} alt="用户头像"/><Avatar icon={<span class="i-mdi-account text-[24px]" />} alt="默认用户"/><Avatar color="#f56a00">张</Avatar><Avatar color="#87d068" textColor="#163800"><b>UI</b></Avatar></div>
}
