<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- 黑色装饰圆圈 -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-black rounded-full opacity-5 blur-3xl animate-float"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-black rounded-full opacity-5 blur-3xl animate-float-delayed"></div>
      <div class="absolute top-1/2 left-1/4 w-64 h-64 bg-black rounded-full opacity-3 blur-3xl animate-float-slow"></div>
      
      <!-- 黑色线条装饰 -->
      <svg class="absolute top-0 left-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.05" />
          </linearGradient>
        </defs>
        <path d="M0,100 Q250,50 500,100 T1000,100" stroke="url(#lineGradient)" stroke-width="2" fill="none" class="animate-draw-line" />
        <path d="M0,300 Q300,250 600,300 T1200,300" stroke="url(#lineGradient)" stroke-width="2" fill="none" class="animate-draw-line-delayed" />
      </svg>
    </div>

    <!-- 主卡片容器 -->
    <div class="relative z-10 w-full max-w-md px-6">
      <transition name="fade-slide" mode="out-in">
        <div 
          :key="isLogin ? 'login' : 'register'"
          class="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:shadow-3xl"
        >
          <!-- Logo区域 -->
          <div class="text-center mb-8 transform transition-all duration-300 hover:scale-105">
            <div class="inline-block mb-4">
              <h1 class="text-4xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent animate-gradient">
                SyncNote
              </h1>
            </div>
            <p class="text-gray-600 text-sm font-medium tracking-wide">AI实时协同文档库</p>
            <div class="mt-4 flex justify-center gap-2">
              <div class="w-2 h-2 bg-black rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 bg-black rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-black rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>

          <!-- 表单区域 -->
          <div class="relative">
            <LoginForm v-if="isLogin" :toggle-mode="toggleMode" />
            <RegisterForm v-else :toggle-mode="toggleMode" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const isLogin = ref(true)

function toggleMode() {
  isLogin.value = !isLogin.value
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
