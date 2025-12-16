<template>
  <div class="space-y-4">
    <div>
      <label>邮箱</label>
      <input v-model="loginForm.email" type="email" placeholder="请输入邮箱" />
    </div>
    <div>
      <label>密码</label>
      <input v-model="loginForm.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
    </div>
    <button @click="handleLogin" :disabled="isLoading">{{ isLoading ? '登录中...' : '登录' }}</button>
    <p>
      还没有账号？
      <button @click="toggleMode">立即注册</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/auth/useAuth'
const { loginForm, handleLogin, isLoading, toggleMode } = useAuth()
</script>
