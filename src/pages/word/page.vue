<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { wordApi, type Word, type CreateWordDto } from '@/api/word'
import { collectionApi, type Collection } from '@/api/collection'
import type { PaginationMeta } from '@/api/types'
import PageHeader from '@/components/shared/PageHeader.vue'
import CursorPagination from '@/components/shared/CursorPagination.vue'
import DeleteDialog from '@/components/shared/DeleteDialog.vue'
import SearchableSelect from '@/components/shared/SearchableSelect.vue'
import DataTable from './ui/DataTable.vue'
import WordForm from './ui/WordForm.vue'

const search = ref('')
const pageSize = ref('10')
const currentPage = ref(1)
const collectionFilter = ref<string>('all')
const loading = ref(false)
const words = ref<Word[]>([])
const meta = ref<PaginationMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 0, hasNextPage: false, hasPreviousPage: false })
const collections = ref<Collection[]>([])

const formOpen = ref(false)
const editingWord = ref<Word | null>(null)
const formLoading = ref(false)

const deleteOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleteLoading = ref(false)

onMounted(async () => {
  try {
    const { data } = await collectionApi.getAll({ pageSize: 100 })
    collections.value = data.data.data
  } catch { /* ignore */ }
})

async function fetchWords() {
  loading.value = true
  try {
    const { data } = await wordApi.getAll({
      page: currentPage.value,
      pageSize: Number(pageSize.value),
      search: search.value || undefined,
      collectionId: collectionFilter.value !== 'all' ? collectionFilter.value : undefined,
    })
    words.value = data.data.data
    meta.value = data.data.meta
  } catch {
    words.value = []
  } finally {
    loading.value = false
  }
}

watch([pageSize, collectionFilter], () => { currentPage.value = 1; fetchWords() })
watch(search, () => { currentPage.value = 1; fetchWords() })
fetchWords()

function goToPage(page: number) {
  currentPage.value = page
  fetchWords()
}

function openCreate() { editingWord.value = null; formOpen.value = true }
function openEdit(word: Word) { editingWord.value = word; formOpen.value = true }

async function handleSubmit(formData: CreateWordDto) {
  formLoading.value = true
  try {
    if (editingWord.value) {
      const { collectionId, ...updateData } = formData
      await wordApi.update(editingWord.value.id, updateData)
    } else {
      await wordApi.create(formData)
    }
    formOpen.value = false
    fetchWords()
  } finally {
    formLoading.value = false
  }
}

function openDelete(id: string) { deletingId.value = id; deleteOpen.value = true }

async function handleDelete() {
  if (!deletingId.value) return
  deleteLoading.value = true
  try {
    await wordApi.delete(deletingId.value)
    deleteOpen.value = false
    fetchWords()
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="So'zlar" create-label="Yangi so'z" v-model:search="search" @create="openCreate">
      <template #filters>
        <SearchableSelect
          v-model="collectionFilter"
          :options="collections.map(c => ({ value: c.id, label: c.name.uz }))"
          placeholder="To'plam"
          all-label="Barcha to'plamlar"
        />
      </template>
    </PageHeader>

    <DataTable :data="words" :loading="loading" :page="currentPage" :page-size="Number(pageSize)" @edit="openEdit" @delete="openDelete" />
    <CursorPagination :meta="meta" :loading="loading" v-model:page-size="pageSize" @change="goToPage" />
    <WordForm :open="formOpen" :word="editingWord" :loading="formLoading" @update:open="formOpen = $event" @submit="handleSubmit" />
    <DeleteDialog v-model:open="deleteOpen" :loading="deleteLoading" @confirm="handleDelete" />
  </div>
</template>
