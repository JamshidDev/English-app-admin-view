<script setup lang="ts">
import type { Report } from '@/api/reports'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  data: Report[]
  loading?: boolean
  page?: number
  pageSize?: number
}>()

defineEmits<{
  open: [report: Report]
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function statusColor(status: string) {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (status === 'fixed') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}

function statusLabel(status: string) {
  if (status === 'pending') return 'Kutilmoqda'
  if (status === 'fixed') return 'Tuzatildi'
  return "O'tkazildi"
}
</script>

<template>
  <div class="rounded-md border relative h-[calc(100vh-280px)] overflow-auto">
    <div v-if="loading" class="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-md">
      <div class="flex items-center gap-2 text-muted-foreground">
        <Loader2 class="size-5 animate-spin text-primary" />
        <span class="text-sm">Yuklanmoqda...</span>
      </div>
    </div>
    <Table>
      <TableHeader class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-[0_1px_0_0_hsl(var(--border))]">
        <TableRow>
          <TableHead class="w-12">#</TableHead>
          <TableHead>Foydalanuvchi</TableHead>
          <TableHead>So'z</TableHead>
          <TableHead>Xabar</TableHead>
          <TableHead>Holat</TableHead>
          <TableHead>Sana</TableHead>
          <TableHead class="w-16 text-right">Amal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="data.length">
          <TableRow
            v-for="(item, index) in data"
            :key="item.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="$emit('open', item)"
          >
            <TableCell class="font-medium">{{ ((props.page || 1) - 1) * (props.pageSize || 10) + index + 1 }}</TableCell>
            <TableCell>
              <div class="font-medium text-sm">{{ item.clientName }}</div>
            </TableCell>
            <TableCell class="font-medium">{{ item.wordSnapshot.word }}</TableCell>
            <TableCell class="max-w-48 truncate text-muted-foreground">{{ item.message }}</TableCell>
            <TableCell>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="statusColor(item.status)">
                {{ statusLabel(item.status) }}
              </span>
            </TableCell>
            <TableCell class="text-muted-foreground text-xs">{{ formatDate(item.createdAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="size-8" @click.stop>
                    <MoreHorizontal class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click.stop="$emit('open', item)">
                    <Eye class="size-4 mr-2" /> Ko'rish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </template>
        <TableEmpty v-else :colspan="7">Xatolik xabarlari topilmadi</TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
