import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface NavChild {
  title: string
  path: string
}

export interface NavItem {
  title: string
  icon: Component
  path?: string
  children?: NavChild[]
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'Vocabulary',
    icon: BookOpen,
    children: [
      { title: 'Kategoriyalar', path: '/category' },
      { title: "To'plamlar", path: '/collection' },
      { title: "So'zlar", path: '/word' },
    ],
  },
  {
    title: 'Klientlar',
    icon: Users,
    children: [
      { title: 'Mijozlar', path: '/client' },
      { title: 'Kategoriyalar', path: '/client-category' },
    ],
  },
  {
    title: 'Sozlamalar',
    icon: Settings,
    path: '/settings',
  },
]
