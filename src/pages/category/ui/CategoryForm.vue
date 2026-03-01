<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category } from '@/api/category'
import type { TranslatedField } from '@/api/types'
import { Button } from '@/components/ui/button'
import TranslatedInput from '@/components/shared/TranslatedInput.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  category?: Category | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { name: TranslatedField }]
}>()

const emptyName = (): TranslatedField => ({ uz: '', ru: '' })
const form = ref({ name: emptyName() })

watch(() => props.open, (val) => {
  if (val && props.category) {
    form.value = { name: { ...props.category.name } }
  } else if (val) {
    form.value = { name: emptyName() }
  }
})

function handleSubmit() {
  emit('submit', { name: { ...form.value.name } })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ category ? 'Tahrirlash' : "Yangi kategoriya" }}</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <TranslatedInput v-model="form.name" label="Nomi" required />
        <DialogFooter class="gap-2">
          <Button variant="outline" type="button" @click="$emit('update:open', false)">Bekor qilish</Button>
          <Button type="submit" :disabled="loading || !form.name.uz">
            {{ loading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
