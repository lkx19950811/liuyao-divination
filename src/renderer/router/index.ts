import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '起卦' }
  },
  {
    path: '/result/:id?',
    name: 'Result',
    component: () => import('../views/Result.vue'),
    meta: { title: '解卦结果' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: { title: '历史记录' }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('../views/Knowledge.vue'),
    meta: { title: '知识库' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '六爻预测'} - 六爻预测`
  next()
})

export default router
