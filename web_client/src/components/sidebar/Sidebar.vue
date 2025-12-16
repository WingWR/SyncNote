<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 左侧边栏 -->
    <aside class="w-16 bg-white border-r border-gray-200 flex flex-col relative shrink-0">
      <!-- 回到主页 -->
      <div class="p-2 border-b border-gray-200 shrink-0">
        <SidebarButton
          title="回到主页"
          :icon="Home"
          :active="false"
          :onClick="goHome"
        />
      </div>

      <!-- 功能入口 -->
      <div class="flex-1 flex flex-col py-2 overflow-y-auto">
        <SidebarButton
          title="文档管理"
          :icon="FilePlus"
          :active="sidebarStore.activePanel === 'document'"
          :onClick="() => handlePanelClick('document')"
        />
        <SidebarButton
          title="工作区"
          :icon="FolderOpen"
          :active="sidebarStore.activePanel === 'workspace'"
          :onClick="() => handlePanelClick('workspace')"
        />
        <SidebarButton
          title="AI助手"
          :icon="Bot"
          :active="sidebarStore.activePanel === 'ai'"
          :onClick="() => handlePanelClick('ai')"
        />
      </div>

      <!-- 底部系统设置 -->
      <div class="shrink-0">
        <SystemSettingsPanel />
      </div>
    </aside>

    <!-- 面板抽屉 -->
    <SidebarPanel :title="getPanelTitle(sidebarStore.activePanel)">
      <DocumentManager v-if="sidebarStore.activePanel === 'document'" />
      <WorkspacePanel v-if="sidebarStore.activePanel === 'workspace'" />
      <AIChatPanel v-if="sidebarStore.activePanel === 'ai'" />
    </SidebarPanel>

    <!-- 主内容区 -->
    <main
      :class="['flex-1 overflow-hidden transition-all duration-300', sidebarStore.activePanel ? 'ml-80' : '']"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Home, FilePlus, FolderOpen, Bot } from 'lucide-vue-next'
import DocumentManager from '../document/DocumentManager.vue'
import WorkspacePanel from '../workplace/WorkspacePanel.vue'
import AIChatPanel from '../ai/AIChatPanel.vue'
import SystemSettingsPanel from '../SystemSettings/SystemSettingsPanel.vue'
import SidebarButton from './SidebarButton.vue'
import SidebarPanel from './SidebarPanel.vue'
import { useSidebar } from '../../composables/sidebar/useSidebar'

const { sidebarStore, goHome, handlePanelClick, getPanelTitle } = useSidebar()
</script>

<style scoped>
/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

/* 滚动条样式 */
aside::-webkit-scrollbar,
div::-webkit-scrollbar {
  width: 6px;
}
aside::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
  background: #f1f1f1;
}
aside::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
aside::-webkit-scrollbar-thumb:hover,
div::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
