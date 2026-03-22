import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/page.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/page.vue'),
      },
      {
        path: 'category',
        name: 'category',
        component: () => import('@/pages/category/page.vue'),
      },
      {
        path: 'collection',
        name: 'collection',
        component: () => import('@/pages/collection/page.vue'),
      },
      {
        path: 'word',
        name: 'word',
        component: () => import('@/pages/word/page.vue'),
      },
      {
        path: 'client',
        name: 'client',
        component: () => import('@/pages/client/page.vue'),
      },
      {
        path: 'client-category',
        name: 'client-category',
        component: () => import('@/pages/client-category/page.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/pages/reports/page.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/settings/page.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
