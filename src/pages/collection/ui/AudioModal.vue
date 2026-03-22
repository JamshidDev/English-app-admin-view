<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { wordApi, type Word } from '@/api/word'
import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { RefreshCw, Loader2, Check, X, Play, Square, Music, Zap } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  collectionId: string | null
  collectionName: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const words = ref<Word[]>([])
const loading = ref(false)
const generatingAll = ref(false)
const currentGeneratingWord = ref<string | null>(null)
const currentGeneratingIndex = ref(0)
const regeneratingId = ref<string | null>(null)
const playingId = ref<string | null>(null)
const currentAudio = ref<HTMLAudioElement | null>(null)
const generationLog = ref<{ word: string; status: 'pending' | 'loading' | 'success' | 'error' | 'skipped'; message?: string }[]>([])

const audioCount = computed(() => words.value.filter(w => w.audioUrl).length)
const progressPercent = computed(() => words.value.length ? Math.round((audioCount.value / words.value.length) * 100) : 0)

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.collectionId) {
    generationLog.value = []
    currentGeneratingWord.value = null
    await fetchWords()
  }
})

async function fetchWords() {
  if (!props.collectionId) return
  loading.value = true
  try {
    const { data } = await wordApi.getAll({ collectionId: props.collectionId, pageSize: 100 })
    words.value = data.data.data
  } catch {
    words.value = []
  } finally {
    loading.value = false
  }
}

async function generateAllStepByStep() {
  if (!props.collectionId) return
  generatingAll.value = true
  currentGeneratingIndex.value = 0

  generationLog.value = words.value.map(w => ({
    word: w.word,
    status: w.audioUrl ? 'skipped' as const : 'pending' as const,
    message: w.audioUrl ? 'Mavjud' : undefined,
  }))

  for (let i = 0; i < words.value.length; i++) {
    const word = words.value[i]
    currentGeneratingIndex.value = i

    const logEntry = generationLog.value[i]
    if (!word) continue

    if (word.audioUrl) {
      if (logEntry) { logEntry.status = 'skipped'; logEntry.message = 'Mavjud' }
      continue
    }

    currentGeneratingWord.value = word.word
    if (logEntry) logEntry.status = 'loading'

    try {
      const { data } = await wordApi.generateSingleAudio(word.id)
      const w = words.value[i]
      if (w) w.audioUrl = data.data?.audioUrl || null
      if (logEntry) { logEntry.status = 'success'; logEntry.message = 'Yaratildi' }
    } catch (e: any) {
      if (logEntry) { logEntry.status = 'error'; logEntry.message = (e as any).response?.data?.message || 'Xatolik' }
    }
  }

  currentGeneratingWord.value = null
  generatingAll.value = false
}

async function regenerateSingle(wordId: string) {
  regeneratingId.value = wordId
  try {
    const { data } = await wordApi.generateSingleAudio(wordId)
    const updated = data.data
    const idx = words.value.findIndex(w => w.id === wordId)
    if (idx !== -1 && updated && words.value[idx]) {
      words.value[idx].audioUrl = updated.audioUrl
    }
  } catch {
    // ignore
  } finally {
    regeneratingId.value = null
  }
}

function playAudio(word: Word) {
  if (playingId.value === word.id) {
    stopAudio()
    return
  }
  stopAudio()
  if (!word.audioUrl) return

  playingId.value = word.id
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/admin', '') || ''
  const url = word.audioUrl.startsWith('http') ? word.audioUrl : `${baseUrl}${word.audioUrl}`

  const audio = new Audio(url)
  currentAudio.value = audio

  audio.onended = () => {
    playingId.value = null
    currentAudio.value = null
  }
  audio.onerror = () => {
    playingId.value = null
    currentAudio.value = null
  }
  audio.play().catch(() => {
    playingId.value = null
    currentAudio.value = null
  })
}

function stopAudio() {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value = null
  }
  playingId.value = null
}

function close() {
  stopAudio()
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="close">
    <DialogContent class="!max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 border-b bg-background flex-shrink-0">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-3 text-lg">
            <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Music class="size-4 text-primary-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold">Audio boshqaruv</div>
              <div class="text-sm font-normal text-muted-foreground truncate">{{ collectionName }}</div>
            </div>
          </DialogTitle>
          <DialogDescription class="sr-only">So'zlar uchun audio generatsiya</DialogDescription>
        </DialogHeader>

        <!-- Generate button -->
        <div class="mt-3">
          <Button
            @click="generateAllStepByStep"
            :disabled="generatingAll"
            class="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold"
          >
            <Loader2 v-if="generatingAll" class="size-4 animate-spin" />
            <Zap v-else class="size-4" />
            {{ generatingAll ? `Generatsiya... (${currentGeneratingIndex + 1}/${words.length})` : 'Barchasini ovozlashtirish' }}
          </Button>
        </div>

        <!-- Stats + progress -->
        <div class="mt-3 flex items-center gap-3">
          <span class="text-xs text-muted-foreground">{{ audioCount }}/{{ words.length }} audio</span>
          <div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="progressPercent === 100 ? 'bg-green-500' : 'bg-primary'"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <span class="text-xs font-semibold" :class="progressPercent === 100 ? 'text-green-600' : 'text-primary'">
            {{ progressPercent }}%
          </span>
        </div>

        <!-- Current word -->
        <div v-if="generatingAll && currentGeneratingWord" class="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 class="size-3 animate-spin text-primary" />
          {{ currentGeneratingWord }} ({{ currentGeneratingIndex + 1 }}/{{ words.length }})
        </div>
      </div>

      <!-- Words List -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div v-if="loading" class="p-12 text-center text-muted-foreground">
          <Loader2 class="size-8 animate-spin mx-auto mb-3 text-gray-400" />
          <p class="text-sm">Yuklanmoqda...</p>
        </div>

        <div v-else class="px-4 py-3">
          <div v-for="(word, index) in words" :key="word.id" class="flex gap-3">
            <!-- Step line -->
            <div class="flex flex-col items-center w-7 flex-shrink-0">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 flex-shrink-0"
                :class="{
                  'border-green-500 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400': word.audioUrl || generationLog[index]?.status === 'success',
                  'border-blue-500 bg-blue-100 text-blue-700 animate-pulse dark:bg-blue-900/40 dark:text-blue-400': generationLog[index]?.status === 'loading',
                  'border-red-500 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400': generationLog[index]?.status === 'error',
                  'border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500': !word.audioUrl && !generationLog[index]?.status,
                  'border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800': generationLog[index]?.status === 'pending',
                  'border-yellow-400 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': generationLog[index]?.status === 'skipped',
                }"
              >
                <Check v-if="word.audioUrl || generationLog[index]?.status === 'success'" class="size-3" />
                <Loader2 v-else-if="generationLog[index]?.status === 'loading'" class="size-3 animate-spin" />
                <X v-else-if="generationLog[index]?.status === 'error'" class="size-3" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div
                v-if="index < words.length - 1"
                class="w-px flex-1 min-h-[6px] transition-all duration-300"
                :class="{
                  'bg-green-300 dark:bg-green-800': word.audioUrl || generationLog[index]?.status === 'success',
                  'bg-gray-200 dark:bg-gray-800': !word.audioUrl && generationLog[index]?.status !== 'success',
                }"
              />
            </div>

            <!-- Word card -->
            <div
              class="flex-1 flex items-center gap-2 px-3 py-2.5 mb-1.5 rounded-lg border transition-all duration-300"
              :class="{
                'border-green-200 bg-green-50/50 dark:border-green-800/40 dark:bg-green-950/10': word.audioUrl && generationLog[index]?.status !== 'loading',
                'border-blue-400 bg-blue-50 shadow-sm dark:border-blue-600 dark:bg-blue-950/20': generationLog[index]?.status === 'loading',
                'border-red-200 bg-red-50/50 dark:border-red-800/40': generationLog[index]?.status === 'error',
                'border-gray-200 dark:border-gray-800': !word.audioUrl && generationLog[index]?.status !== 'loading' && generationLog[index]?.status !== 'error',
              }"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm">{{ word.word }}</span>
                  <span v-if="word.transcription" class="text-[11px] text-muted-foreground">{{ word.transcription }}</span>
                </div>
                <div class="text-xs text-muted-foreground mt-0.5 truncate">{{ word.wordTranslate?.uz }}</div>
              </div>

              <!-- Log message -->
              <span
                v-if="generationLog[index]?.message"
                class="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                :class="{
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': generationLog[index]?.status === 'success' || generationLog[index]?.status === 'skipped',
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': generationLog[index]?.status === 'error',
                }"
              >
                {{ generationLog[index].message }}
              </span>

              <!-- Status -->
              <div v-else-if="word.audioUrl" class="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Check class="size-3 text-green-600 dark:text-green-400" />
              </div>
              <div v-else class="size-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <X class="size-3 text-gray-400" />
              </div>

              <!-- Play -->
              <button
                class="size-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                :class="word.audioUrl ? 'hover:bg-green-100 dark:hover:bg-green-900/30' : 'opacity-30 cursor-not-allowed'"
                :disabled="!word.audioUrl"
                @click="playAudio(word)"
              >
                <Square v-if="playingId === word.id" class="size-3.5 text-red-500 fill-red-500" />
                <Play v-else class="size-3.5 text-green-600 dark:text-green-400" />
              </button>

              <!-- Regenerate -->
              <button
                class="size-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                :disabled="regeneratingId === word.id || generatingAll"
                @click="regenerateSingle(word.id)"
              >
                <Loader2 v-if="regeneratingId === word.id" class="size-3.5 animate-spin text-blue-500" />
                <RefreshCw v-else class="size-3.5 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between flex-shrink-0">
        <span class="text-[11px] text-muted-foreground">Google Cloud TTS (Neural2-D)</span>
        <Button variant="outline" size="sm" @click="close">Yopish</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
