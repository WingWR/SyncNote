<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-2">SyncNote</h1>
      <p class="text-center text-gray-600 mb-8">AI实时协同文档库</p>
      
      <div v-if="isLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="请输入邮箱"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="handleLogin"
          />
        </div>
        <button
          @click="handleLogin"
          :disabled="isLoading"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        <p class="text-center text-sm text-gray-600">
          还没有账号？
          <button @click="isLogin = false" class="text-blue-600 hover:underline">
            立即注册
          </button>
        </p>
      </div>
      
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="registerForm.username"
            type="text"
            placeholder="请输入用户名"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="handleRegister"
          />
        </div>
        <button
          @click="handleRegister"
          :disabled="isLoading"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        <p class="text-center text-sm text-gray-600">
          已有账号？
          <button @click="isLogin = true" class="text-blue-600 hover:underline">
            立即登录
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi } from '../api/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const isLoading = ref(false)
const loginForm = reactive({
  email: '',
  password: ''
})
const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

async function handleLogin() {
  if (!loginForm.email || !loginForm.password) return
  
  isLoading.value = true
  try {
    const response = await userApi.login(loginForm)
    localStorage.setItem('token', response.token)
    userStore.setUser(response.user)
    router.push('/home')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查邮箱和密码')
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (!registerForm.username || !registerForm.email || !registerForm.password) return
  
  isLoading.value = true
  try {
    const response = await userApi.register(registerForm)
    localStorage.setItem('token', response.token)
    userStore.setUser(response.user)
    router.push('/home')
  } catch (error) {
    console.error('注册失败:', error)
    alert('注册失败，请检查输入信息')
  } finally {
    isLoading.value = false
  }
}
</script>


