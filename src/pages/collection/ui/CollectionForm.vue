<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Collection } from '@/api/collection'
import type { Category } from '@/api/category'
import type { TranslatedField } from '@/api/types'
import { categoryApi } from '@/api/category'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import TranslatedInput from '@/components/shared/TranslatedInput.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  collection?: Collection | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { categoryId: string; name: TranslatedField }]
}>()

const emptyName = (): TranslatedField => ({ uz: '', ru: '' })
const form = ref({ categoryId: '', name: emptyName() })
const categories = ref<Category[]>([])

onMounted(async () => {
  try {
    const { data } = await categoryApi.getAll({ pageSize: 100 })
    categories.value = data.data.data
  } catch { /* ignore */ }
})

watch(() => props.open, (val) => {
  if (val && props.collection) {
    form.value = {
      categoryId: props.collection.categoryId,
      name: { ...props.collection.name },
    }
  } else if (val) {
    form.value = { categoryId: '', name: emptyName() }
  }
})

function handleSubmit() {
  emit('submit', { categoryId: form.value.categoryId, name: { ...form.value.name } })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ collection ? 'Tahrirlash' : "Yangi to'plam" }}</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>Kategoriya *</Label>
          <Select v-model="form.categoryId" required>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Tanlang..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name.uz }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TranslatedInput v-model="form.name" label="Nomi" required />
        <DialogFooter class="gap-2">
          <Button variant="outline" type="button" @click="$emit('update:open', false)">Bekor qilish</Button>
          <Button type="submit" :disabled="loading || !form.name.uz || !form.categoryId">
            {{ loading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
