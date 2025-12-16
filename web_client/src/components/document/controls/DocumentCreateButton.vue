<template>
  <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
    <FilePlus :size="16" />
    <span>新建文件</span>
  </button>
</template>

<script setup lang="ts">
import { FilePlus } from 'lucide-vue-next'
</script>
