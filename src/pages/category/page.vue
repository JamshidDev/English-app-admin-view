<script setup lang="ts">
import { ref, watch } from 'vue'
import { categoryApi, type Category } from '@/api/category'
import type { PaginationMeta, TranslatedField } from '@/api/types'
import PageHeader from '@/components/shared/PageHeader.vue'
import CursorPagination from '@/components/shared/CursorPagination.vue'
import DeleteDialog from '@/components/shared/DeleteDialog.vue'
import DataTable from './ui/DataTable.vue'
import CategoryForm from './ui/CategoryForm.vue'

const search = ref('')
const pageSize = ref('10')
const currentPage = ref(1)
const loading = ref(false)
const categories = ref<Category[]>([])
const meta = ref<PaginationMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 0, hasNextPage: false, hasPreviousPage: false })

const formOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const formLoading = ref(false)

const deleteOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleteLoading = ref(false)

async function fetchCategories() {
  loading.value = true
  try {
    const { data } = await categoryApi.getAll({
      page: currentPage.value,
      pageSize: Number(pageSize.value),
      search: search.value || undefined,
    })
    categories.value = data.data.data
    meta.value = data.data.meta
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
}

watch([pageSize], () => { currentPage.value = 1; fetchCategories() })
watch(search, () => { currentPage.value = 1; fetchCategories() })
fetchCategories()

function goToPage(page: number) {
  currentPage.value = page
  fetchCategories()
}

function openCreate() { editingCategory.value = null; formOpen.value = true }
function openEdit(category: Category) { editingCategory.value = category; formOpen.value = true }

async function handleSubmit(formData: { name: TranslatedField }) {
  formLoading.value = true
  try {
    if (editingCategory.value) {
      await categoryApi.update(editingCategory.value.id, formData)
    } else {
      await categoryApi.create(formData)
    }
    formOpen.value = false
    fetchCategories()
  } finally {
    formLoading.value = false
  }
}

function openDelete(id: string) { deletingId.value = id; deleteOpen.value = true }

async function handleDelete() {
  if (!deletingId.value) return
  deleteLoading.value = true
  try {
    await categoryApi.delete(deletingId.value)
    deleteOpen.value = false
    fetchCategories()
  } finally {
    deleteLoading.value = false
  }
}

async function handleTogglePublic(id: string) {
  try {
    await categoryApi.togglePublic(id)
    fetchCategories()
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="Kategoriyalar" v-model:search="search" @create="openCreate" />
    <DataTable :data="categories" :loading="loading" @edit="openEdit" @delete="openDelete" @toggle-public="handleTogglePublic" />
    <CursorPagination :meta="meta" :loading="loading" v-model:page-size="pageSize" @change="goToPage" />
    <CategoryForm :open="formOpen" :category="editingCategory" :loading="formLoading" @update:open="formOpen = $event" @submit="handleSubmit" />
    <DeleteDialog v-model:open="deleteOpen" :loading="deleteLoading" @confirm="handleDelete" />
  </div>
</template>
