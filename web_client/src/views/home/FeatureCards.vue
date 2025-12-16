<template>
  <div class="grid md:grid-cols-2 gap-6 text-left">
    <Card bg="blue-50" icon="FileText" iconColor="text-blue-600" title="多格式支持" description="支持 .txt、.md、.docx、.pptx 等多种文档格式的实时协同编辑" />
    <Card bg="green-50" icon="Users" iconColor="text-green-600" title="实时协同" description="基于 Y.js 技术，支持多人同时编辑，实时同步文档内容" />
    <Card bg="purple-50" icon="Bot" iconColor="text-purple-600" title="AI 助手" description="集成多种大模型，提供智能写作建议和文档分析功能" />
    <Card bg="orange-50" icon="Shield" iconColor="text-orange-600" title="安全可靠" description="完善的权限管理系统，保护您的文档安全" />
  </div>
</template>

<script setup lang="ts">
import Card from './FeatureCard.vue'
</script>

