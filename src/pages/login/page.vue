<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  username: '',
  password: '',
})
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(form.value)
    router.push({ name: 'dashboard' })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message || "Login yoki parol noto'g'ri"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted px-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
          E
        </div>
        <CardTitle class="text-2xl">EasyEnglish</CardTitle>
        <CardDescription>Admin panelga kirish</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">Login</Label>
            <Input
              id="username"
              v-model="form.username"
              placeholder="admin"
              required
              autofocus
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Parol</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="********"
              required
            />
          </div>

          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Kirish...' : 'Kirish' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
