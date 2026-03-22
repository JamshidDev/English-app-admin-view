<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown, Search, Check, X } from 'lucide-vue-next'

const props = defineProps<{
  options: { value: string; label: string }[]
  placeholder?: string
  allLabel?: string
  triggerClass?: string
}>()

const modelValue = defineModel<string>({ default: 'all' })
const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

const selectedLabel = computed(() => {
  if (modelValue.value === 'all' && props.allLabel) return props.allLabel
  const found = props.options.find(o => o.value === modelValue.value)
  return found?.label || props.placeholder || 'Tanlang'
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => inputRef.value?.focus())
  }
}

function clear(e: Event) {
  e.stopPropagation()
  modelValue.value = 'all'
  searchQuery.value = ''
}

function select(value: string) {
  modelValue.value = value
  isOpen.value = false
  searchQuery.value = ''
}

watch(() => props.options, () => {
  searchQuery.value = ''
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger -->
    <button
      type="button"
      @click="toggle"
      :class="[
        'flex h-9 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        triggerClass || 'w-48'
      ]"
    >
      <span class="truncate text-left flex-1" :class="modelValue === 'all' ? 'text-muted-foreground' : ''">
        {{ selectedLabel }}
      </span>
      <button
        v-if="modelValue !== 'all'"
        type="button"
        @click="clear"
        class="size-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        <X class="size-2.5" />
      </button>
      <ChevronDown v-else class="size-4 opacity-50 flex-shrink-0" />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 z-50 mt-1 w-full min-w-[200px] rounded-md border bg-popover text-popover-foreground shadow-md"
      >
        <!-- Search -->
        <div class="p-2 border-b">
          <div class="flex items-center gap-2 px-2 py-1.5 rounded-md border bg-background">
            <Search class="size-3.5 text-muted-foreground flex-shrink-0" />
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              class="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Qidirish..."
            />
          </div>
        </div>

        <!-- Options -->
        <div class="max-h-[220px] overflow-y-auto p-1">
          <!-- All option -->
          <button
            v-if="allLabel"
            type="button"
            @click="select('all')"
            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <Check class="size-3.5 flex-shrink-0" :class="modelValue === 'all' ? 'opacity-100' : 'opacity-0'" />
            <span>{{ allLabel }}</span>
          </button>

          <!-- Filtered options -->
          <button
            v-for="opt in filteredOptions"
            :key="opt.value"
            type="button"
            @click="select(opt.value)"
            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <Check class="size-3.5 flex-shrink-0" :class="modelValue === opt.value ? 'opacity-100' : 'opacity-0'" />
            <span class="truncate">{{ opt.label }}</span>
          </button>

          <!-- Empty -->
          <div v-if="filteredOptions.length === 0 && searchQuery" class="px-3 py-4 text-sm text-muted-foreground text-center">
            Topilmadi
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
