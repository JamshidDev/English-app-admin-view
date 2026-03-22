import http from './http'
import type { ApiResponse } from './types'

export interface DashboardStats {
  totalWords: number
  totalCollections: number
  totalClients: number
  totalCategories: number
  totalQuizzes: number
  completedQuizzes: number
  audioWords: number
  todayActiveUsers: number
}

export interface WeeklyActivity {
  date: string
  activeUsers: number
}

export interface TopCollection {
  name: string
  quizCount: number
  completedCount: number
}

export interface RecentClient {
  id: string
  firstName: string
  lastName: string | null
  telegramId: string
  createdAt: string
}

export const dashboardApi = {
  getStats() {
    return http.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  },
  getWeeklyActivity() {
    return http.get<ApiResponse<WeeklyActivity[]>>('/dashboard/weekly-activity')
  },
  getTopCollections() {
    return http.get<ApiResponse<TopCollection[]>>('/dashboard/top-collections')
  },
  getRecentClients() {
    return http.get<ApiResponse<RecentClient[]>>('/dashboard/recent-clients')
  },
}
