<template>
  <div class="space-y-6">
    <!-- 邮箱输入框 -->
    <div class="group">
      <label class="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-300 group-focus-within:text-black">
        邮箱
      </label>
      <div class="relative">
        <input 
          v-model="loginForm.email" 
          type="email" 
          placeholder="请输入邮箱"
          class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 placeholder:text-gray-400 text-gray-900 font-medium"
        />
        <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-focus-within:w-full"></div>
      </div>
    </div>

    <!-- 密码输入框 -->
    <div class="group">
      <label class="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-300 group-focus-within:text-black">
        密码
      </label>
      <div class="relative">
        <input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
          class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 placeholder:text-gray-400 text-gray-900 font-medium"
        />
        <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-focus-within:w-full"></div>
      </div>
    </div>

    <!-- 登录按钮 -->
    <button 
      @click="handleLogin" 
      :disabled="isLoading"
      class="w-full py-3.5 bg-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform relative overflow-hidden group"
    >
      <span class="relative z-10 flex items-center justify-center gap-2">
        <span v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ isLoading ? '登录中...' : '登录' }}</span>
      </span>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    </button>

    <!-- 切换注册 -->
    <div class="text-center pt-4 border-t border-gray-100">
      <p class="text-sm text-gray-600">
        还没有账号？
        <button 
          @click="toggleMode"
          class="ml-1 text-black font-semibold hover:underline transition-all duration-300 relative group"
        >
          立即注册
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/auth/useAuth'

const props = defineProps<{
  toggleMode: () => void
}>()

const { loginForm, handleLogin, isLoading } = useAuth()
</script>
