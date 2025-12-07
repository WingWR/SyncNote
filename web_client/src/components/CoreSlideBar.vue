<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 左侧边栏（始终折叠） -->
    <aside class="w-16 bg-white border-r border-gray-200 flex flex-col relative shrink-0">
      <!-- 顶部：回到主页按钮 -->
      <div class="p-2 border-b border-gray-200 shrink-0">
        <button
          @click="goHome"
          class="w-full flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="回到主页"
        >
          <Home :size="20" />
        </button>
      </div>

      <!-- 功能入口区域 -->
      <div class="flex-1 flex flex-col py-2 overflow-y-auto">
        <!-- 文档管理入口 -->
        <button
          @click="handlePanelClick('document')"
          class="flex flex-col items-center gap-1 p-3 mx-2 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'bg-blue-100 text-blue-700': sidebarStore.activePanel === 'document' }"
          title="文档管理"
        >
          <FilePlus :size="24" />
          <span class="text-xs">文档</span>
        </button>

        <!-- 工作区入口 -->
        <button
          @click="handlePanelClick('workspace')"
          class="flex flex-col items-center gap-1 p-3 mx-2 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'bg-blue-100 text-blue-700': sidebarStore.activePanel === 'workspace' }"
          title="工作区"
        >
          <FolderOpen :size="24" />
          <span class="text-xs">工作区</span>
        </button>

        <!-- AI助手入口 -->
        <button
          @click="handlePanelClick('ai')"
          class="flex flex-col items-center gap-1 p-3 mx-2 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          :class="{ 'bg-blue-100 text-blue-700': sidebarStore.activePanel === 'ai' }"
          title="AI助手"
        >
          <Bot :size="24" />
          <span class="text-xs">AI</span>
        </button>
      </div>

      <!-- 底部系统设置 -->
      <div class="shrink-0">
        <SystemSettings />
      </div>
    </aside>

    <!-- 功能面板抽屉 -->
    <Transition name="slide">
      <div
        v-if="sidebarStore.activePanel"
        class="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 absolute left-16 top-0 bottom-0"
      >
        <!-- 面板头部 -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ getPanelTitle(sidebarStore.activePanel) }}
          </h3>
          <button
            @click="sidebarStore.closePanel"
            class="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            title="关闭"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- 面板内容 -->
        <div class="flex-1 overflow-y-auto">
          <DocumentManager v-if="sidebarStore.activePanel === 'document'" />
          <Workspace v-if="sidebarStore.activePanel === 'workspace'" />
          <AIChatWindow v-if="sidebarStore.activePanel === 'ai'" />
        </div>
      </div>
    </Transition>

    <!-- 右侧主内容区 -->
    <main
      :class="[
        'flex-1 overflow-hidden transition-all duration-300',
        sidebarStore.activePanel ? 'ml-80' : ''
      ]"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Home, FilePlus, FolderOpen, Bot, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '../stores/sidebar'
import DocumentManager from './DocumentManager.vue'
import Workspace from './Workspace.vue'
import AIChatWindow from './AIChatWindow.vue'
import SystemSettings from './SystemSettings.vue'

const router = useRouter()
const sidebarStore = useSidebarStore()

function goHome() {
  router.push('/home')
}

function handlePanelClick(panel: 'document' | 'workspace' | 'ai') {
  if (sidebarStore.activePanel === panel) {
    // 如果点击的是当前已打开的面板，则关闭
    sidebarStore.closePanel()
  } else {
    // 否则打开新面板
    sidebarStore.openPanel(panel)
  }
}

function getPanelTitle(panel: string | null): string {
  const titles: Record<string, string> = {
    document: '文档管理',
    workspace: '工作区',
    ai: 'AI助手'
  }
  return titles[panel || ''] || ''
}
</script>

<style scoped>
/* 自定义滚动条样式 */
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

/* 抽屉滑入动画 */
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
</style>
