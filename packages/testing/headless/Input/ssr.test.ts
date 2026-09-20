// @vitest-environment node
import { createRoot } from 'solid-js'
import { expect, it } from 'vitest'
import { createInput, createPassword } from '../../../competence/src/input'
// 输入与密码 headless 初始化不访问 window/document，服务端可导入；不等同于整套 UI SSR 认证。
it('[input.headless.ssr] initializes without DOM',()=>{
 let dispose=()=>{}
 try {createRoot(d=>{dispose=d;expect(createInput({defaultValue:'ssr'}).value()).toBe('ssr');expect(createPassword().visible()).toBe(false)})}finally{dispose()}
})
