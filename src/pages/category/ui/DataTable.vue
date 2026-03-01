<script setup lang="ts">
import type { Category } from '@/api/category'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps<{
  data: Category[]
  loading?: boolean
}>()

defineEmits<{
  edit: [category: Category]
  delete: [id: string]
  togglePublic: [id: string]
}>()
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">#</TableHead>
          <TableHead>O'zbekcha</TableHead>
          <TableHead>Ruscha</TableHead>
          <TableHead class="w-20">Ommaviy</TableHead>
          <TableHead class="w-24 text-right">Amallar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow>
            <TableCell colspan="5" class="h-24 text-center text-muted-foreground">
              Yuklanmoqda...
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="data.length">
          <TableRow v-for="(item, index) in data" :key="item.id">
            <TableCell class="font-medium">{{ index + 1 }}</TableCell>
            <TableCell class="font-medium">{{ item.name.uz }}</TableCell>
            <TableCell class="text-muted-foreground">{{ item.name.ru }}</TableCell>
            <TableCell>
              <Switch
                :model-value="item.public"
                @update:model-value="$emit('togglePublic', item.id)"
              />
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="icon" @click="$emit('edit', item)">
                  <Pencil class="size-4" />
                </Button>
                <Button variant="ghost" size="icon" @click="$emit('delete', item.id)">
                  <Trash2 class="size-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </template>
        <TableEmpty v-else :colspan="5">
          Ma'lumot topilmadi
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
