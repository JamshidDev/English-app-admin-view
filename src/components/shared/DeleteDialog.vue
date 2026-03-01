<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  open: boolean
  title?: string
  description?: string
  loading?: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title || "O'chirishni tasdiqlang" }}</DialogTitle>
        <DialogDescription>
          {{ description || "Bu amalni qaytarib bo'lmaydi. Davom etmoqchimisiz?" }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2">
        <Button variant="outline" @click="$emit('update:open', false)" :disabled="loading">
          Bekor qilish
        </Button>
        <Button variant="destructive" @click="$emit('confirm')" :disabled="loading">
          {{ loading ? "O'chirilmoqda..." : "O'chirish" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
