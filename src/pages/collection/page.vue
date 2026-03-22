<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { collectionApi, type Collection } from '@/api/collection'
import { categoryApi, type Category } from '@/api/category'
import type { PaginationMeta, TranslatedField } from '@/api/types'
import PageHeader from '@/components/shared/PageHeader.vue'
import CursorPagination from '@/components/shared/CursorPagination.vue'
import DeleteDialog from '@/components/shared/DeleteDialog.vue'
import SearchableSelect from '@/components/shared/SearchableSelect.vue'
import DataTable from './ui/DataTable.vue'
import CollectionForm from './ui/CollectionForm.vue'
import AudioModal from './ui/AudioModal.vue'

const route = useRoute()

const search = ref('')
const pageSize = ref('10')
const currentPage = ref(1)
const categoryFilter = ref<string>('all')
const loading = ref(false)
const collections = ref<Collection[]>([])
const meta = ref<PaginationMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 0, hasNextPage: false, hasPreviousPage: false })
const categories = ref<Category[]>([])

const formOpen = ref(false)
const editingCollection = ref<Collection | null>(null)
const formLoading = ref(false)

const deleteOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleteLoading = ref(false)

onMounted(async () => {
  try {
    const { data } = await categoryApi.getAll({ pageSize: 100 })
    categories.value = data.data.data
  } catch { /* ignore */ }

  if (route.query.categoryId) {
    categoryFilter.value = route.query.categoryId as string
  }
})

async function fetchCollections() {
  loading.value = true
  try {
    const { data } = await collectionApi.getAll({
      page: currentPage.value,
      pageSize: Number(pageSize.value),
      search: search.value || undefined,
      categoryId: categoryFilter.value !== 'all' ? categoryFilter.value : undefined,
    })
    collections.value = data.data.data
    meta.value = data.data.meta
  } catch {
    collections.value = []
  } finally {
    loading.value = false
  }
}

watch([pageSize, categoryFilter], () => { currentPage.value = 1; fetchCollections() })
watch(search, () => { currentPage.value = 1; fetchCollections() })
fetchCollections()

function goToPage(page: number) {
  currentPage.value = page
  fetchCollections()
}

function openCreate() { editingCollection.value = null; formOpen.value = true }
function openEdit(collection: Collection) { editingCollection.value = collection; formOpen.value = true }

async function handleSubmit(formData: { categoryId: string; name: TranslatedField }) {
  formLoading.value = true
  try {
    if (editingCollection.value) {
      await collectionApi.update(editingCollection.value.id, { name: formData.name, categoryId: formData.categoryId })
    } else {
      await collectionApi.create(formData)
    }
    formOpen.value = false
    fetchCollections()
  } finally {
    formLoading.value = false
  }
}

function openDelete(id: string) { deletingId.value = id; deleteOpen.value = true }

async function handleDelete() {
  if (!deletingId.value) return
  deleteLoading.value = true
  try {
    await collectionApi.delete(deletingId.value)
    deleteOpen.value = false
    fetchCollections()
  } finally {
    deleteLoading.value = false
  }
}

async function handleTogglePublic(id: string) {
  try {
    await collectionApi.togglePublic(id)
    fetchCollections()
  } catch { /* ignore */ }
}

async function handleToggleNew(id: string) {
  try {
    await collectionApi.toggleNew(id)
    fetchCollections()
  } catch { /* ignore */ }
}

const audioModalOpen = ref(false)
const audioCollectionId = ref<string | null>(null)
const audioCollectionName = ref('')

function handleOpenAudioModal(collectionId: string) {
  const col = collections.value.find(c => c.id === collectionId)
  audioCollectionId.value = collectionId
  audioCollectionName.value = col?.name?.uz || ''
  audioModalOpen.value = true
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="To'plamlar" create-label="Yangi to'plam" v-model:search="search" @create="openCreate">
      <template #filters>
        <SearchableSelect
          v-model="categoryFilter"
          :options="categories.map(c => ({ value: c.id, label: c.name.uz }))"
          placeholder="Kategoriya"
          all-label="Barcha kategoriyalar"
        />
      </template>
    </PageHeader>

    <DataTable :data="collections" :loading="loading" :page="currentPage" :page-size="Number(pageSize)" @edit="openEdit" @delete="openDelete" @toggle-public="handleTogglePublic" @toggle-new="handleToggleNew" @generate-audio="handleOpenAudioModal" />
    <CursorPagination :meta="meta" :loading="loading" v-model:page-size="pageSize" @change="goToPage" />
    <CollectionForm :open="formOpen" :collection="editingCollection" :loading="formLoading" @update:open="formOpen = $event" @submit="handleSubmit" />
    <DeleteDialog v-model:open="deleteOpen" :loading="deleteLoading" @confirm="handleDelete" />
    <AudioModal v-model:open="audioModalOpen" :collection-id="audioCollectionId" :collection-name="audioCollectionName" />
  </div>
</template>
