<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dashboardApi, type DashboardStats, type WeeklyActivity, type TopCollection, type RecentClient } from '@/api/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpen, Users, FolderTree, GraduationCap, Volume2, Activity,
  Trophy, BarChart3, UserPlus,
} from 'lucide-vue-next'

const stats = ref<DashboardStats | null>(null)
const weeklyActivity = ref<WeeklyActivity[]>([])
const topCollections = ref<TopCollection[]>([])
const recentClients = ref<RecentClient[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const [statsRes, weeklyRes, topRes, recentRes] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getWeeklyActivity(),
      dashboardApi.getTopCollections(),
      dashboardApi.getRecentClients(),
    ])
    stats.value = statsRes.data.data
    weeklyActivity.value = weeklyRes.data.data
    topCollections.value = topRes.data.data
    recentClients.value = recentRes.data.data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})

const mainStats = computed(() => {
  if (!stats.value) return []
  return [
    { title: "So'zlar", value: stats.value.totalWords, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: "To'plamlar", value: stats.value.totalCollections, icon: FolderTree, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Foydalanuvchilar', value: stats.value.totalClients, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { title: 'Quizlar', value: stats.value.totalQuizzes, icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ]
})

const secondaryStats = computed(() => {
  if (!stats.value) return []
  return [
    { title: 'Kategoriyalar', value: stats.value.totalCategories, icon: FolderTree },
    { title: 'Tugatilgan', value: stats.value.completedQuizzes, icon: Trophy },
    { title: 'Audio', value: stats.value.audioWords, icon: Volume2 },
    { title: 'Bugun faol', value: stats.value.todayActiveUsers, icon: Activity },
  ]
})

const maxActivity = computed(() => Math.max(...weeklyActivity.value.map(w => w.activeUsers), 1))

function formatDay(date: string) {
  const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
  return days[new Date(date).getDay()]
}

function formatShortDate(date: string) {
  const d = new Date(date)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  return `${days} kun oldin`
}

const audioPercent = computed(() => {
  if (!stats.value || !stats.value.totalWords) return 0
  return Math.round((stats.value.audioWords / stats.value.totalWords) * 100)
})

const quizCompletionRate = computed(() => {
  if (!stats.value || !stats.value.totalQuizzes) return 0
  return Math.round((stats.value.completedQuizzes / stats.value.totalQuizzes) * 100)
})
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Umumiy statistika va analitika</p>
      </div>
      <Badge variant="outline" class="text-xs font-normal">
        {{ new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' }) }}
      </Badge>
    </div>

    <!-- Skeleton Loading -->
    <template v-if="loading">
      <!-- Stats skeleton -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="rounded-xl border p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <Skeleton class="h-3 w-16" />
              <Skeleton class="h-7 w-20" />
            </div>
            <Skeleton class="size-10 rounded-xl" />
          </div>
        </div>
      </div>
      <!-- Secondary skeleton -->
      <div class="flex items-center gap-6 px-1">
        <Skeleton v-for="i in 4" :key="i" class="h-4 w-24" />
      </div>
      <!-- Chart + progress skeleton -->
      <div class="grid gap-4 lg:grid-cols-5">
        <Card class="lg:col-span-3">
          <CardContent class="pt-6">
            <Skeleton class="h-4 w-32 mb-4" />
            <div class="flex items-end gap-1.5 h-32">
              <div v-for="i in 7" :key="i" class="flex-1 flex flex-col items-center gap-1.5">
                <Skeleton class="w-full rounded-md" :style="{ height: `${20 + Math.random() * 70}px` }" />
                <Skeleton class="h-3 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div class="lg:col-span-2 space-y-4">
          <Card v-for="i in 2" :key="i">
            <CardContent class="pt-4 pb-4 space-y-3">
              <div class="flex items-center gap-3">
                <Skeleton class="size-8 rounded-lg" />
                <div class="flex-1 space-y-1.5">
                  <Skeleton class="h-3 w-20" />
                  <Skeleton class="h-5 w-12" />
                </div>
              </div>
              <Skeleton class="h-1.5 w-full rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
      <!-- Bottom skeleton -->
      <div class="grid gap-4 lg:grid-cols-2">
        <Card v-for="i in 2" :key="i">
          <CardContent class="pt-6 space-y-3">
            <Skeleton class="h-4 w-28" />
            <div v-for="j in 4" :key="j" class="flex items-center gap-3 py-1.5">
              <Skeleton class="size-6 rounded-md" />
              <Skeleton class="h-4 flex-1" />
              <Skeleton class="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <template v-else-if="stats">
      <!-- Main stats -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in mainStats"
          :key="stat.title"
          class="group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md"
          :class="stat.border"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-muted-foreground mb-1">{{ stat.title }}</p>
              <p class="text-2xl font-bold tracking-tight">{{ stat.value.toLocaleString() }}</p>
            </div>
            <div class="size-10 rounded-xl flex items-center justify-center" :class="stat.bg">
              <component :is="stat.icon" class="size-5" :class="stat.color" />
            </div>
          </div>
          <!-- Decorative gradient -->
          <div class="absolute -bottom-4 -right-4 size-20 rounded-full opacity-[0.07]" :class="stat.bg.replace('/10', '')"></div>
        </div>
      </div>

      <!-- Secondary stats (inline) -->
      <div class="flex items-center gap-6 px-1">
        <div v-for="stat in secondaryStats" :key="stat.title" class="flex items-center gap-2">
          <component :is="stat.icon" class="size-3.5 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">{{ stat.title }}:</span>
          <span class="text-sm font-semibold">{{ stat.value }}</span>
        </div>
      </div>

      <!-- Middle row: Chart + Progress -->
      <div class="grid gap-4 lg:grid-cols-5">
        <!-- Weekly activity chart -->
        <Card class="lg:col-span-3">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <BarChart3 class="size-4" />
              Haftalik faollik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-end gap-1.5 h-32 pt-2">
              <div
                v-for="(day, i) in weeklyActivity"
                :key="day.date"
                class="flex-1 flex flex-col items-center gap-1.5 group"
              >
                <!-- Value -->
                <span class="text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {{ day.activeUsers }}
                </span>
                <!-- Bar -->
                <div class="w-full relative">
                  <div
                    class="w-full rounded-md transition-all duration-700 ease-out"
                    :class="i === weeklyActivity.length - 1 ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'"
                    :style="{
                      height: `${Math.max((day.activeUsers / maxActivity) * 90, 6)}px`,
                    }"
                  />
                </div>
                <!-- Day label -->
                <div class="text-center">
                  <div class="text-[10px] font-medium" :class="i === weeklyActivity.length - 1 ? 'text-foreground' : 'text-muted-foreground'">
                    {{ formatDay(day.date) }}
                  </div>
                  <div class="text-[9px] text-muted-foreground/60">{{ formatShortDate(day.date) }}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Progress cards -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Audio progress -->
          <Card>
            <CardContent class="pt-4 pb-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Volume2 class="size-4 text-cyan-500" />
                </div>
                <div class="flex-1">
                  <p class="text-xs text-muted-foreground">Audio generatsiya</p>
                  <p class="text-lg font-bold">{{ audioPercent }}%</p>
                </div>
                <span class="text-xs text-muted-foreground">{{ stats.audioWords }}/{{ stats.totalWords }}</span>
              </div>
              <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="audioPercent === 100 ? 'bg-green-500' : 'bg-cyan-500'"
                  :style="{ width: audioPercent + '%' }"
                />
              </div>
            </CardContent>
          </Card>

          <!-- Quiz completion -->
          <Card>
            <CardContent class="pt-4 pb-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <GraduationCap class="size-4 text-amber-500" />
                </div>
                <div class="flex-1">
                  <p class="text-xs text-muted-foreground">Quiz tugatish</p>
                  <p class="text-lg font-bold">{{ quizCompletionRate }}%</p>
                </div>
                <span class="text-xs text-muted-foreground">{{ stats.completedQuizzes }}/{{ stats.totalQuizzes }}</span>
              </div>
              <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-amber-500 transition-all duration-700"
                  :style="{ width: quizCompletionRate + '%' }"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Top collections -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Trophy class="size-4 text-amber-500" />
              Top to'plamlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="topCollections.filter(c => c.quizCount > 0).length === 0" class="text-sm text-muted-foreground text-center py-6">
              Hali quiz yechilmagan
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(col, index) in topCollections.filter(c => c.quizCount > 0).slice(0, 5)"
                :key="col.name"
                class="flex items-center gap-3 py-1.5"
              >
                <div
                  class="size-6 rounded-md flex items-center justify-center text-xs font-bold"
                  :class="{
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': index === 0,
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400': index === 1,
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': index === 2,
                    'bg-muted text-muted-foreground': index > 2,
                  }"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ col.name }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">{{ col.quizCount }} quiz</span>
                  <div class="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full bg-amber-500"
                      :style="{ width: topCollections.filter(c => c.quizCount > 0)[0]?.quizCount ? `${(col.quizCount / (topCollections.filter(c => c.quizCount > 0)[0]?.quizCount || 1)) * 100}%` : '0%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent clients -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <UserPlus class="size-4 text-violet-500" />
              Yangi foydalanuvchilar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="recentClients.length === 0" class="text-sm text-muted-foreground text-center py-6">
              Foydalanuvchilar yo'q
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="client in recentClients"
                :key="client.id"
                class="flex items-center gap-3 py-1.5"
              >
                <div class="size-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                  {{ (client.firstName ?? '?').charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ client.firstName }} {{ client.lastName || '' }}</p>
                  <p class="text-[11px] text-muted-foreground font-mono">{{ client.telegramId }}</p>
                </div>
                <span class="text-[11px] text-muted-foreground whitespace-nowrap">{{ timeAgo(client.createdAt) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
