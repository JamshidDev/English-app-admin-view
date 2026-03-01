<script setup lang="ts">
import { ref } from 'vue'
import type { TranslatedField } from '@/api/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineProps<{
  label: string
  required?: boolean
}>()

const model = defineModel<TranslatedField>({ required: true })

const tabs = [
  { key: 'uz' as const, label: 'UZ', flag: '🇺🇿', placeholder: "O'zbekcha" },
  { key: 'ru' as const, label: 'RU', flag: '🇷🇺', placeholder: 'Русский' },
]

const activeTab = ref<keyof TranslatedField>('uz')

function update(key: keyof TranslatedField, value: string) {
  model.value = { ...model.value, [key]: value }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label>{{ label }} {{ required ? '*' : '' }}</Label>
      <div class="inline-flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="relative inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200"
          :class="[
            activeTab === tab.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="activeTab = tab.key"
        >
          <span class="text-xs leading-none">{{ tab.flag }}</span>
          <span>{{ tab.label }}</span>
          <span
            v-if="model[tab.key]"
            class="size-1.5 rounded-full bg-emerald-500"
          />
        </button>
      </div>
    </div>
    <div class="relative">
      <template v-for="tab in tabs" :key="tab.key">
        <Input
          v-show="activeTab === tab.key"
          :model-value="model[tab.key]"
          @update:model-value="update(tab.key, $event as string)"
          :placeholder="tab.placeholder"
          :required="required && tab.key === 'uz'"
        />
      </template>
    </div>
  </div>
</template>
