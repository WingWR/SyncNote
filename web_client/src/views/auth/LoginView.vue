<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-2">SyncNote</h1>
      <p class="text-center mb-8">AI实时协同文档库</p>

      <LoginForm v-if="isLogin" />
      <RegisterForm v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/auth/useAuth'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const { isLogin } = useAuth()
</script>
