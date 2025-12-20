<template>
    <div id="app">
        <router-view></router-view>

        <!-- 全局用户编辑对话框 -->
        <GlobalUserEditDialog />

        <!-- 全局文档操作菜单 -->
        <GlobalDocumentActionMenu />
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import GlobalUserEditDialog from './components/global/GlobalUserEditDialog.vue'
import GlobalDocumentActionMenu from './components/global/GlobalDocumentActionMenu.vue'
import { useGlobalDocumentMenuStore } from './stores/globalDocumentMenu'

const globalMenuStore = useGlobalDocumentMenuStore()

onMounted(() => {
  globalMenuStore.init()
})

onUnmounted(() => {
  globalMenuStore.destroy()
})
</script>