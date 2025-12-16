<template>
  <div class="space-y-4">
    <div>
      <label>用户名</label>
      <input v-model="registerForm.username" type="text" placeholder="请输入用户名" />
    </div>
    <div>
      <label>邮箱</label>
      <input v-model="registerForm.email" type="email" placeholder="请输入邮箱" />
    </div>
    <div>
      <label>密码</label>
      <input v-model="registerForm.password" type="password" placeholder="请输入密码" @keyup.enter="handleRegister" />
    </div>
    <button @click="handleRegister" :disabled="isLoading">{{ isLoading ? '注册中...' : '注册' }}</button>
    <p>
      已有账号？
      <button @click="toggleMode">立即登录</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/auth/useAuth'
const { registerForm, handleRegister, isLoading, toggleMode } = useAuth()
</script>
