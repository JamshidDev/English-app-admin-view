<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const nameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    category: 'Kategoriyalar',
    collection: "To'plamlar",
    word: "So'zlar",
    client: 'Mijozlar',
    'client-category': 'Mijoz kategoriyalari',
    settings: 'Sozlamalar',
  }

  const name = route.name as string
  return nameMap[name] || name
})
</script>

<template>
  <nav class="text-sm text-muted-foreground">
    {{ breadcrumbs }}
  </nav>
</template>
