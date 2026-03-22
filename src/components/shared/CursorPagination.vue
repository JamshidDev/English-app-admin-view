<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import type { PaginationMeta } from '@/api/types'

const props = defineProps<{
  meta: PaginationMeta
  loading?: boolean
}>()

const emit = defineEmits<{
  change: [page: number]
  'update:pageSize': [size: string]
}>()

const pageSize = defineModel<string>('pageSize', { default: '10' })

const info = computed(() => {
  const { page, pageSize, total } = props.meta
  if (total === 0) return { from: 0, to: 0 }
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return { from, to }
})

const visiblePages = computed(() => {
  const { page, pageCount } = props.meta
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  if (page <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', pageCount)
  } else if (page >= pageCount - 3) {
    pages.push(1, '...', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount)
  } else {
    pages.push(1, '...', page - 1, page, page + 1, '...', pageCount)
  }

  return pages
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <p class="text-sm text-muted-foreground whitespace-nowrap">Satrlar:</p>
      <Select v-model="pageSize">
        <SelectTrigger class="h-8 w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top">
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
      <p class="text-sm text-muted-foreground whitespace-nowrap">
        {{ meta.total > 0 ? `${info.from}–${info.to} / ${meta.total}` : "Ma'lumot yo'q" }}
      </p>
    </div>

    <div class="flex items-center gap-1" v-if="meta.pageCount > 1">
      <!-- First page -->
      <Button
        variant="outline"
        size="icon"
        class="size-8"
        :disabled="!meta.hasPreviousPage || loading"
        @click="$emit('change', 1)"
      >
        <ChevronsLeft class="size-4" />
      </Button>

      <!-- Prev page -->
      <Button
        variant="outline"
        size="icon"
        class="size-8"
        :disabled="!meta.hasPreviousPage || loading"
        @click="$emit('change', meta.page - 1)"
      >
        <ChevronLeft class="size-4" />
      </Button>

      <!-- Page buttons -->
      <template v-for="(p, i) in visiblePages" :key="i">
        <span v-if="p === '...'" class="px-1 text-sm text-muted-foreground">…</span>
        <Button
          v-else
          :variant="p === meta.page ? 'default' : 'outline'"
          size="icon"
          class="size-8"
          :disabled="loading"
          @click="$emit('change', p)"
        >
          {{ p }}
        </Button>
      </template>

      <!-- Next page -->
      <Button
        variant="outline"
        size="icon"
        class="size-8"
        :disabled="!meta.hasNextPage || loading"
        @click="$emit('change', meta.page + 1)"
      >
        <ChevronRight class="size-4" />
      </Button>

      <!-- Last page -->
      <Button
        variant="outline"
        size="icon"
        class="size-8"
        :disabled="!meta.hasNextPage || loading"
        @click="$emit('change', meta.pageCount)"
      >
        <ChevronsRight class="size-4" />
      </Button>
    </div>
  </div>
</template>
