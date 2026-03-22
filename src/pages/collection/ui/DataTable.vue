<script setup lang="ts">
import type { Collection } from '@/api/collection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Volume2, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  data: Collection[]
  loading?: boolean
  page?: number
  pageSize?: number
}>()

defineEmits<{
  edit: [collection: Collection]
  delete: [id: string]
  togglePublic: [id: string]
  toggleNew: [id: string]
  generateAudio: [id: string]
}>()
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
          <TableHead>O'zbekcha</TableHead>
          <TableHead>Ruscha</TableHead>
          <TableHead class="w-20">So'zlar</TableHead>
          <TableHead class="w-20">Ommaviy</TableHead>
          <TableHead class="w-16">Yangi</TableHead>
          <TableHead class="w-16 text-right">Amallar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="data.length">
          <TableRow v-for="(item, index) in data" :key="item.id">
            <TableCell class="font-medium">{{ ((props.page || 1) - 1) * (props.pageSize || 10) + index + 1 }}</TableCell>
            <TableCell class="font-medium">{{ item.name.uz }}</TableCell>
            <TableCell class="text-muted-foreground">{{ item.name.ru }}</TableCell>
            <TableCell>
              <Badge variant="secondary">{{ item.wordCount ?? 0 }}</Badge>
            </TableCell>
            <TableCell>
              <Switch :model-value="item.public" @update:model-value="$emit('togglePublic', item.id)" />
            </TableCell>
            <TableCell>
              <Switch :model-value="item.isNew" @update:model-value="$emit('toggleNew', item.id)" />
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="size-8">
                    <MoreHorizontal class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('generateAudio', item.id)">
                    <Volume2 class="size-4 mr-2 text-blue-500" /> Audio boshqaruv
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('edit', item)">
                    <Pencil class="size-4 mr-2" /> Tahrirlash
                  </DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive" @click="$emit('delete', item.id)">
                    <Trash2 class="size-4 mr-2" /> O'chirish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </template>
        <TableEmpty v-else :colspan="7">Ma'lumot topilmadi</TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
