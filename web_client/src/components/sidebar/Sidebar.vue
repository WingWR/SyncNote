<template>
  <div class="flex h-screen bg-gradient-to-br from-white via-gray-50 to-white">
    <!-- 左侧边栏 -->
    <aside class="w-16 bg-white/95 backdrop-blur-sm border-r border-gray-100 flex flex-col relative shrink-0 shadow-lg rounded-r-2xl">
      <!-- 功能入口 -->
      <div class="flex-1 flex flex-col py-2 overflow-y-auto">
        <SidebarButton
          title="回到主页"
          :icon="Home"
          :active="false"
          :onClick="goHome"
        />
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
    <SidebarPanel :title="getPanelTitle(sidebarStore.activePanel)" :z-index="getPanelZIndex(sidebarStore.activePanel)">
      <DocumentManager v-if="sidebarStore.activePanel === 'document'" />
      <WorkspacePanel v-if="sidebarStore.activePanel === 'workspace'" />
      <AIChatPanel v-if="sidebarStore.activePanel === 'ai'" />
      <SystemSettingsContent v-if="sidebarStore.activePanel === 'settings'" />
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
import SystemSettingsContent from '../SystemSettings/SystemSettingsContent.vue'
import SidebarButton from './SidebarButton.vue'
import SidebarPanel from './SidebarPanel.vue'
import { useSidebar } from '../../composables/sidebar/useSidebar'

const { sidebarStore, goHome, handlePanelClick, getPanelTitle } = useSidebar()

function getPanelZIndex(panel: string | null): number {
  // 为不同的面板设置不同的z-index，确保不会有重叠问题
  switch (panel) {
    case 'document':
      return 20
    case 'workspace':
      return 20
    case 'ai':
      return 20
    default:
      return 10
  }
}
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
