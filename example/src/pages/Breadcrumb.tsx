import { type Component } from 'solid-js'
import { Breadcrumb, Divider } from 'upthrust-ui'

const BreadcrumbPage: Component = () => {
  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Breadcrumb 面包屑</h2>
      <p class="text-gray-600 mb-6">显示当前页面在系统层级结构中的位置，并能向上返回。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Breadcrumb
        items={[
          { title: '首页', href: '/' },
          { title: '组件', href: '/components' },
          { title: '导航', href: '/navigation' },
          { title: '面包屑' },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义分隔符</h3>
      <Breadcrumb
        separator=">"
        items={[
          { title: '首页', href: '/' },
          { title: '组件库', href: '/lib' },
          { title: '面包屑' },
        ]}
      />

      <div class="mt-4" />

      <Breadcrumb
        separator={<span class="i-mdi-chevron-right text-base align-middle" />}
        items={[
          { title: '应用', href: '/' },
          { title: '设置', href: '/settings' },
          { title: '通知' },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多级路径</h3>
      <Breadcrumb
        items={[
          { title: '首页', href: '/' },
          { title: '用户管理', href: '/users' },
          { title: '用户列表', href: '/users/list' },
          { title: '用户详情', href: '/users/detail' },
          { title: '编辑' },
        ]}
      />
    </div>
  )
}

export default BreadcrumbPage
