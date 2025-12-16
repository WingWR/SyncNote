<template>
  <div class="max-w-4xl mx-auto px-6 py-12 text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-4">SyncNote</h1>
    <p class="text-xl text-gray-600 mb-8">AI实时协同文档库</p>
    
    <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">欢迎使用 SyncNote</h2>
      <slot /> <!-- 卡片插槽 -->
    </div>

    <div class="text-gray-500 text-sm mb-4">
      <p>开始使用：点击左侧边栏的"新建文件"或"导入文件"按钮</p>
    </div>

    <slot name="dev-link" /> <!-- 开发环境测试链接 -->
  </div>
</template>

<script setup lang="ts">
</script>
