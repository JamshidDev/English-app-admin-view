<script setup lang="ts">
import type { Word } from '@/api/word'
import { Badge } from '@/components/ui/badge'
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
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps<{
  data: Word[]
  loading?: boolean
}>()

defineEmits<{
  edit: [word: Word]
  delete: [id: string]
}>()
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">#</TableHead>
          <TableHead>So'z</TableHead>
          <TableHead>Tarjima</TableHead>
          <TableHead>Transkripsiya</TableHead>
          <TableHead>Misol</TableHead>
          <TableHead class="w-24 text-right">Amallar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow>
            <TableCell colspan="6" class="h-24 text-center text-muted-foreground">
              Yuklanmoqda...
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="data.length">
          <TableRow v-for="(item, index) in data" :key="item.id">
            <TableCell class="font-medium">{{ index + 1 }}</TableCell>
            <TableCell class="font-medium">{{ item.word }}</TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge v-if="item.wordTranslate?.uz" variant="secondary">
                  {{ item.wordTranslate.uz }}
                </Badge>
                <Badge v-if="item.wordTranslate?.ru" variant="outline">
                  {{ item.wordTranslate.ru }}
                </Badge>
                <span v-if="!item.wordTranslate?.uz && !item.wordTranslate?.ru" class="text-muted-foreground">—</span>
              </div>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ item.transcription || '—' }}</TableCell>
            <TableCell class="text-muted-foreground max-w-48 truncate">
              {{ item.example || '—' }}
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
        <TableEmpty v-else :colspan="6">
          Ma'lumot topilmadi
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
