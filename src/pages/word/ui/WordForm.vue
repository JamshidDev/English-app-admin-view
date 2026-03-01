<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Word, CreateWordDto } from '@/api/word'
import type { Collection } from '@/api/collection'
import type { TranslatedField } from '@/api/types'
import { collectionApi } from '@/api/collection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  word?: Word | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: CreateWordDto]
}>()

const emptyTranslate = (): TranslatedField => ({ uz: '', ru: '' })
const form = ref({
  collectionId: '',
  word: '',
  wordTranslate: emptyTranslate(),
  transcription: '',
  example: '',
  exampleTranslate: emptyTranslate(),
})
const collections = ref<Collection[]>([])

onMounted(async () => {
  try {
    const { data } = await collectionApi.getAll({ pageSize: 100 })
    collections.value = data.data.data
  } catch { /* ignore */ }
})

watch(() => props.open, (val) => {
  if (val && props.word) {
    form.value = {
      collectionId: props.word.collectionId || '',
      word: props.word.word,
      wordTranslate: { ...(props.word.wordTranslate || emptyTranslate()) },
      transcription: props.word.transcription || '',
      example: props.word.example || '',
      exampleTranslate: { ...(props.word.exampleTranslate || emptyTranslate()) },
    }
  } else if (val) {
    form.value = {
      collectionId: '',
      word: '',
      wordTranslate: emptyTranslate(),
      transcription: '',
      example: '',
      exampleTranslate: emptyTranslate(),
    }
  }
})

function handleSubmit() {
  const data: CreateWordDto = {
    collectionId: form.value.collectionId,
    word: form.value.word,
    wordTranslate: { ...form.value.wordTranslate },
  }
  if (form.value.transcription) data.transcription = form.value.transcription
  if (form.value.example) {
    data.example = form.value.example
    if (form.value.exampleTranslate.uz) {
      data.exampleTranslate = { ...form.value.exampleTranslate }
    }
  }
  emit('submit', data)
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ word ? "So'zni tahrirlash" : "Yangi so'z" }}</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>To'plam *</Label>
          <Select v-model="form.collectionId" required>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Tanlang..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="col in collections" :key="col.id" :value="col.id">
                {{ col.name.uz }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="word">So'z (inglizcha) *</Label>
          <Input id="word" v-model="form.word" placeholder="apple" required />
        </div>
        <TranslatedInput v-model="form.wordTranslate" label="So'z tarjimasi" required />
        <div class="space-y-2">
          <Label for="transcription">Transkripsiya</Label>
          <Input id="transcription" v-model="form.transcription" placeholder="/ˈæp.əl/" />
        </div>
        <div class="space-y-2">
          <Label for="example">Misol gap</Label>
          <Input id="example" v-model="form.example" placeholder="I eat an apple every day." />
        </div>
        <TranslatedInput v-model="form.exampleTranslate" label="Misol tarjimasi" />
        <DialogFooter class="gap-2">
          <Button variant="outline" type="button" @click="$emit('update:open', false)">Bekor qilish</Button>
          <Button type="submit" :disabled="loading || !form.collectionId || !form.word || !form.wordTranslate.uz">
            {{ loading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
