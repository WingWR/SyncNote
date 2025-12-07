<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
    <div class="max-w-4xl mx-auto px-6 py-12 text-center">
      <h1 class="text-5xl font-bold text-gray-900 mb-4">SyncNote</h1>
      <p class="text-xl text-gray-600 mb-8">
        AI实时协同文档库
      </p>
      
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">欢迎使用 SyncNote</h2>
        
        <div class="grid md:grid-cols-2 gap-6 text-left">
          <div class="p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText :size="20" class="text-blue-600" />
              多格式支持
            </h3>
            <p class="text-gray-600 text-sm">
              支持 .txt、.md、.docx、.pptx 等多种文档格式的实时协同编辑
            </p>
          </div>
          
          <div class="p-4 bg-green-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Users :size="20" class="text-green-600" />
              实时协同
            </h3>
            <p class="text-gray-600 text-sm">
              基于 Y.js 技术，支持多人同时编辑，实时同步文档内容
            </p>
          </div>
          
          <div class="p-4 bg-purple-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Bot :size="20" class="text-purple-600" />
              AI 助手
            </h3>
            <p class="text-gray-600 text-sm">
              集成多种大模型，提供智能写作建议和文档分析功能
            </p>
          </div>
          
          <div class="p-4 bg-orange-50 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Shield :size="20" class="text-orange-600" />
              安全可靠
            </h3>
            <p class="text-gray-600 text-sm">
              完善的权限管理系统，保护您的文档安全
            </p>
          </div>
        </div>
      </div>
      
      <div class="text-gray-500 text-sm mb-4">
        <p>开始使用：点击左侧边栏的"新建文件"或"导入文件"按钮</p>
      </div>
      
      <!-- 编辑器测试链接（仅开发环境） -->
      <div v-if="isDev" class="mt-6">
        <a
          href="/home/editor-test"
          class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🧪 测试编辑器样式（无需后端）
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Users, Bot, Shield } from 'lucide-vue-next'

const isDev = import.meta.env.DEV
</script>
