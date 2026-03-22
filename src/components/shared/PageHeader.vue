<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-vue-next'

const search = defineModel<string>('search', { default: '' })
const localSearch = ref(search.value)

const debouncedUpdate = useDebounceFn((val: string) => {
  search.value = val
}, 400)

watch(localSearch, (val) => debouncedUpdate(val))
watch(search, (val) => { if (val !== localSearch.value) localSearch.value = val })

defineProps<{
  title: string
  createLabel?: string
}>()

defineEmits<{
  create: []
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <Button @click="$emit('create')">
        <Plus class="mr-2 size-4" />
        {{ createLabel || "Qo'shish" }}
      </Button>
    </div>
    <div class="flex items-center gap-2">
      <div class="relative">
        <Search class="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input v-model="localSearch" placeholder="Qidirish..." class="pl-9 w-64" />
      </div>
      <slot name="filters" />
    </div>
  </div>
</template>
