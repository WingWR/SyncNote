import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import DocumentEditor from '../DocumentEditor.vue'
import { useUserStore } from '../../stores/user'
import { documentApi } from '../../api/document/document'

// Mock API
vi.mock('../../api/document', () => ({
  documentApi: {
    getDocument: vi.fn(),
    getCollaborators: vi.fn(),
    addCollaborator: vi.fn()
  }
}))

// Mock TipTap
vi.mock('@tiptap/vue-3', () => ({
  useEditor: vi.fn(() => ({
    value: {
      destroy: vi.fn()
    }
  }))
}))

// Mock Y.js
vi.mock('yjs', () => ({
  Doc: vi.fn(() => ({
    getText: vi.fn(() => ({
      observe: vi.fn(),
      toString: vi.fn(() => ''),
      delete: vi.fn(),
      insert: vi.fn()
    })),
    destroy: vi.fn()
  }))
}))

// Mock WebSocket
vi.mock('y-websocket', () => ({
  WebsocketProvider: vi.fn(() => ({
    destroy: vi.fn()
  }))
}))

describe('DocumentEditor', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/home/document/:id',
          component: DocumentEditor
        }
      ]
    })

    // 设置测试用户
    const userStore = useUserStore()
    userStore.setUser({
      id: 1,
      username: '测试用户',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: new Date().toISOString()
    })
  })

  it('应该正确渲染文档编辑器', async () => {
    const mockDocument = {
      id: 1,
      ownerId: 1,
      name: '测试文档',
      type: 'txt' as const,
      sizeBytes: 100,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permission: 'write' as const
    }

    vi.mocked(documentApi.getDocument).mockResolvedValue(mockDocument)
    vi.mocked(documentApi.getCollaborators).mockResolvedValue([])

    await router.push('/home/document/1')
    
    const wrapper = mount(DocumentEditor, {
      global: {
        plugins: [router, pinia]
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('测试文档')
  })

  it('应该显示Markdown编辑器当文档类型为md', async () => {
    const mockDocument = {
      id: 1,
      ownerId: 1,
      name: '测试Markdown',
      type: 'md' as const,
      sizeBytes: 100,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permission: 'write' as const
    }

    vi.mocked(documentApi.getDocument).mockResolvedValue(mockDocument)
    vi.mocked(documentApi.getCollaborators).mockResolvedValue([])

    await router.push('/home/document/1')
    
    const wrapper = mount(DocumentEditor, {
      global: {
        plugins: [router, pinia]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const editorContainer = wrapper.find('.prose')
    expect(editorContainer.exists()).toBe(true)
  })

  it('应该显示文本编辑器当文档类型为txt', async () => {
    const mockDocument = {
      id: 1,
      ownerId: 1,
      name: '测试文本',
      type: 'txt' as const,
      sizeBytes: 100,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permission: 'write' as const
    }

    vi.mocked(documentApi.getDocument).mockResolvedValue(mockDocument)
    vi.mocked(documentApi.getCollaborators).mockResolvedValue([])

    await router.push('/home/document/1')
    
    const wrapper = mount(DocumentEditor, {
      global: {
        plugins: [router, pinia]
      }
    })

    await wrapper.vm.$nextTick()
    
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
  })

  it('应该显示协作者信息', async () => {
    const mockDocument = {
      id: 1,
      ownerId: 1,
      name: '测试文档',
      type: 'txt' as const,
      sizeBytes: 100,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permission: 'write' as const
    }

    const mockCollaborators = [
      {
        id: 1,
        documentId: 1,
        userId: 2,
        permission: 'write' as const,
        joinedAt: new Date().toISOString()
      },
      {
        id: 2,
        documentId: 1,
        userId: 3,
        permission: 'read' as const,
        joinedAt: new Date().toISOString()
      }
    ]

    vi.mocked(documentApi.getDocument).mockResolvedValue(mockDocument)
    vi.mocked(documentApi.getCollaborators).mockResolvedValue(mockCollaborators)

    await router.push('/home/document/1')
    
    const wrapper = mount(DocumentEditor, {
      global: {
        plugins: [router, pinia]
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('2')
  })

  it('应该能够打开添加协作者对话框', async () => {
    const mockDocument = {
      id: 1,
      ownerId: 1,
      name: '测试文档',
      type: 'txt' as const,
      sizeBytes: 100,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permission: 'write' as const
    }

    vi.mocked(documentApi.getDocument).mockResolvedValue(mockDocument)
    vi.mocked(documentApi.getCollaborators).mockResolvedValue([])

    await router.push('/home/document/1')
    
    const wrapper = mount(DocumentEditor, {
      global: {
        plugins: [router, pinia]
      }
    })

    await wrapper.vm.$nextTick()
    
    const addButton = wrapper.find('button:contains("添加协作者")')
    await addButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('添加协作者')
  })
})


