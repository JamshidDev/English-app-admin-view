<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, FolderTree, GraduationCap } from 'lucide-vue-next'

const stats = [
  { title: 'Foydalanuvchilar', value: '1,234', icon: Users, change: '+12%' },
  { title: 'Kategoriyalar', value: '24', icon: FolderTree, change: '+3' },
  { title: 'Darslar', value: '156', icon: BookOpen, change: '+8' },
  { title: 'Testlar', value: '89', icon: GraduationCap, change: '+5' },
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.title">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            {{ stat.title }}
          </CardTitle>
          <component :is="stat.icon" class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground">{{ stat.change }} o'tgan oydan</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
