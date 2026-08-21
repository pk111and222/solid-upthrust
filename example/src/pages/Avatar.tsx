import { type Component, createSignal } from 'solid-js'
import { Avatar, AvatarGroup, Divider, Space, Button } from 'upthrust-ui'

const UserIcon = <span class="i-mdi-account text-[24px]" />

const AvatarPage: Component = () => {
  const [size, setSize] = createSignal<'small' | 'middle' | 'large' | number>('middle')

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Avatar 头像</h2>
      <p class="text-on-surface-variant mb-6">用来代表用户或事物，支持图片、图标或文字回退。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Space size="large">
        <Avatar size={64}>U</Avatar>
        <Avatar size="large">U</Avatar>
        <Avatar>U</Avatar>
        <Avatar size="small">U</Avatar>
        <Avatar size={24}>U</Avatar>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">三种回退：图片 → 图标 → 文字</h3>
      <Space size="large">
        <Avatar src="https://api.dicebear.com/9.x/avataaars/svg?seed=upthrust" />
        <Avatar icon={UserIcon} />
        <Avatar>张</Avatar>
        <Avatar src="https://broken.example/x.png" onError={() => console.log('img error')}>
          备
        </Avatar>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">形状与颜色</h3>
      <Space size="large">
        <Avatar shape="square" size="large" color="#f56a00">Z</Avatar>
        <Avatar shape="square" color="#87d068" textColor="#fff">S</Avatar>
        <Avatar shape="circle" color="#1677ff">C</Avatar>
        <Avatar shape="square" size="small" color="#722ed1">小</Avatar>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">动态调整尺寸</h3>
      <Space align="center">
        <Avatar size={typeof size() === 'number' ? size() : size()}>
          {typeof size() === 'number' ? size() : '动'}
        </Avatar>
        <Button size="small" variant="outlined" onClick={() => setSize(s => (typeof s === 'number' ? Math.min(96, s + 8) : 40))}>
          放大
        </Button>
        <Button size="small" variant="outlined" onClick={() => setSize(s => (typeof s === 'number' ? Math.max(24, s - 8) : 24))}>
          缩小
        </Button>
        <Button size="small" onClick={() => setSize('middle')}>重置</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">头像组与最大数量</h3>
      <div class="flex flex-col gap-4">
        <AvatarGroup>
          <Avatar color="#f56a00">A</Avatar>
          <Avatar color="#87d068">B</Avatar>
          <Avatar color="#1677ff">C</Avatar>
          <Avatar color="#722ed1">D</Avatar>
          <Avatar color="#faad14">E</Avatar>
        </AvatarGroup>

        <AvatarGroup maxCount={3}>
          <Avatar color="#f56a00">A</Avatar>
          <Avatar color="#87d068">B</Avatar>
          <Avatar color="#1677ff">C</Avatar>
          <Avatar color="#722ed1">D</Avatar>
          <Avatar color="#faad14">E</Avatar>
        </AvatarGroup>

        <AvatarGroup maxCount={2} size="middle" shape="square">
          <Avatar color="#f56a00">甲</Avatar>
          <Avatar color="#87d068">乙</Avatar>
          <Avatar color="#1677ff">丙</Avatar>
          <Avatar color="#722ed1">丁</Avatar>
        </AvatarGroup>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">响应式尺寸对象</h3>
      <p class="text-sm text-on-surface-variant mb-2">缩放浏览器窗口观察（xs 24 → xxl 100）：</p>
      <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} src="https://api.dicebear.com/9.x/avataaars/svg?seed=responsive">
        R
      </Avatar>
    </div>
  )
}

export default AvatarPage
