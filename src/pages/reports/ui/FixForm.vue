<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Report, FixReportDto } from '@/api/reports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, BookOpen, AlertTriangle, Calendar, Smartphone } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  report: Report | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  fix: [data: FixReportDto]
  skip: []
}>()

const word = ref('')
const translateUz = ref('')
const translateRu = ref('')
const transcription = ref('')
const example = ref('')
const exampleTranslateUz = ref('')
const exampleTranslateRu = ref('')

watch(() => props.open, (isOpen) => {
  if (isOpen && props.report) {
    word.value = props.report.wordSnapshot.word
    translateUz.value = props.report.wordSnapshot.wordTranslate?.uz || ''
    translateRu.value = props.report.wordSnapshot.wordTranslate?.ru || ''
    transcription.value = props.report.wordSnapshot.transcription || ''
    example.value = props.report.wordSnapshot.example || ''
    exampleTranslateUz.value = props.report.wordSnapshot.exampleTranslate?.uz || ''
    exampleTranslateRu.value = props.report.wordSnapshot.exampleTranslate?.ru || ''
  }
})

function handleFix() {
  const data: FixReportDto = {
    word: word.value,
    wordTranslate: { uz: translateUz.value, ru: translateRu.value },
    transcription: transcription.value || undefined,
    example: example.value || undefined,
    exampleTranslate: (exampleTranslateUz.value || exampleTranslateRu.value)
      ? { uz: exampleTranslateUz.value, ru: exampleTranslateRu.value }
      : undefined,
  }
  emit('fix', data)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function pageLabel(page: string) {
  if (page === 'learn') return 'Yodlash'
  if (page === 'quiz') return 'Quiz'
  return 'Writing'
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <AlertTriangle class="size-5 text-yellow-500" />
          Xatolik xabari
        </DialogTitle>
      </DialogHeader>

      <template v-if="report">
        <!-- Xatolik xabari -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm font-medium text-red-800">{{ report.message }}</p>
        </div>

        <!-- User ma'lumotlari -->
        <div class="bg-muted/50 rounded-lg p-3 space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <User class="size-4 text-muted-foreground" />
            <span class="font-medium">{{ report.clientName }}</span>
            <Badge variant="outline" class="text-xs">{{ report.clientTelegramId }}</Badge>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone class="size-4" />
            <span>{{ pageLabel(report.page) }} sahifasidan</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen class="size-4" />
            <span>{{ report.collectionName?.uz || '' }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar class="size-4" />
            <span>{{ formatDate(report.createdAt) }}</span>
          </div>
        </div>

        <Separator />

        <!-- So'z tuzatish formasi -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold">So'z ma'lumotlari</h3>

          <div class="space-y-2">
            <Label>So'z (inglizcha)</Label>
            <Input v-model="word" :disabled="report.status !== 'pending'" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label>Tarjima (uz)</Label>
              <Input v-model="translateUz" :disabled="report.status !== 'pending'" />
            </div>
            <div class="space-y-2">
              <Label>Tarjima (ru)</Label>
              <Input v-model="translateRu" :disabled="report.status !== 'pending'" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Transkripsiya</Label>
            <Input v-model="transcription" :disabled="report.status !== 'pending'" />
          </div>

          <div class="space-y-2">
            <Label>Misol (inglizcha)</Label>
            <Input v-model="example" :disabled="report.status !== 'pending'" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label>Misol tarjimasi (uz)</Label>
              <Input v-model="exampleTranslateUz" :disabled="report.status !== 'pending'" />
            </div>
            <div class="space-y-2">
              <Label>Misol tarjimasi (ru)</Label>
              <Input v-model="exampleTranslateRu" :disabled="report.status !== 'pending'" />
            </div>
          </div>
        </div>
      </template>

      <DialogFooter class="flex gap-2 sm:justify-between">
        <Button variant="outline" @click="emit('update:open', false)">
          Yopish
        </Button>
        <div v-if="report?.status === 'pending'" class="flex gap-2">
          <Button variant="secondary" @click="emit('skip')" :disabled="loading">
            Skip qilish
          </Button>
          <Button @click="handleFix" :disabled="loading">
            {{ loading ? 'Saqlanmoqda...' : 'Tuzatish va saqlash' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
