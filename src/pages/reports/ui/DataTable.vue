<script setup lang="ts">
import type { Report } from '@/api/reports'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from '@/components/ui/table'
import { Eye } from 'lucide-vue-next'

defineProps<{
  data: Report[]
  loading?: boolean
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
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">#</TableHead>
          <TableHead>Foydalanuvchi</TableHead>
          <TableHead>So'z</TableHead>
          <TableHead>Xabar</TableHead>
          <TableHead>Holat</TableHead>
          <TableHead>Sana</TableHead>
          <TableHead class="w-20 text-right">Amal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow>
            <TableCell colspan="7" class="h-24 text-center text-muted-foreground">
              Yuklanmoqda...
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="data.length">
          <TableRow
            v-for="(item, index) in data"
            :key="item.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="$emit('open', item)"
          >
            <TableCell class="font-medium">{{ index + 1 }}</TableCell>
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
              <Button variant="ghost" size="icon" @click.stop="$emit('open', item)">
                <Eye class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </template>
        <TableEmpty v-else :colspan="7">
          Xatolik xabarlari topilmadi
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
