<script setup lang="ts">
import type { Client } from '@/api/client'
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
  data: Client[]
  loading?: boolean
}>()

defineEmits<{
  edit: [client: Client]
  delete: [id: string]
  toggleBlock: [id: string]
}>()
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">#</TableHead>
          <TableHead>Ism</TableHead>
          <TableHead>Familiya</TableHead>
          <TableHead>Telegram ID</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead class="w-24">Bloklangan</TableHead>
          <TableHead class="w-24 text-right">Amallar</TableHead>
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
          <TableRow v-for="(item, index) in data" :key="item.id">
            <TableCell class="font-medium">{{ index + 1 }}</TableCell>
            <TableCell class="font-medium">{{ item.firstName }}</TableCell>
            <TableCell class="text-muted-foreground">{{ item.lastName || '—' }}</TableCell>
            <TableCell class="font-mono text-sm">{{ item.telegramId }}</TableCell>
            <TableCell class="text-muted-foreground">{{ item.phone || '—' }}</TableCell>
            <TableCell>
              <Switch
                :model-value="!!item.blockedAt"
                @update:model-value="$emit('toggleBlock', item.id)"
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
        <TableEmpty v-else :colspan="7">
          Ma'lumot topilmadi
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
