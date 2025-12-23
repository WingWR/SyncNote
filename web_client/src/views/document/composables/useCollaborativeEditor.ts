import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { getDocumentState } from '../../../api/document'

export function useCollaborativeEditor(docId: string) {
  const ydoc = new Y.Doc()
  const isLoaded = ref(false) // 标记历史数据是否加载完成

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;

  const wsUrl = `${protocol}//${host}:8080/ws/document`;
  // 1. 初始化 Provider，但先不连接 (手动控制 connect)
  const provider = new WebsocketProvider(wsUrl, docId.toString(), ydoc, { connect: false })

  // 用来上锁，控制重复加载
  let loadingPromise: Promise<void> | null = null;

  // 提供销毁链接
  const cleanup = () => {
    try {
      provider.awareness.destroy()
      provider.disconnect()
      provider.destroy()
      ydoc.destroy()
    } catch (e) {
      console.error('[Yjs] 清理资源时出错:', e)
    }
  }

  onUnmounted(() => {
    cleanup()
    window.removeEventListener('beforeunload', cleanup)
  })
  // 添加用户直接关闭或者刷新
  window.addEventListener('beforeunload', cleanup)

  const loadHistoryAndConnect = async () => {
    // 避免重复加载
    if (isLoaded.value) return;

    if (loadingPromise) {
      console.log('[Yjs] 发现正在加载中的任务，跳过重复初始化');
      return loadingPromise;
    }

    loadingPromise = (async () => {
      // 直接ws连接，人数秒响应
      provider.connect();
      const dbPromise = getDocumentState(docId.toString());

      try {
        const res = await dbPromise;

        if (res.code === 200 && res.data) {
          const binary = Uint8Array.from(atob(String(res.data)), c => c.charCodeAt(0));

          Y.applyUpdate(ydoc, binary);

          setTimeout(() => {
            console.log('[Yjs] 开始执行后台延迟迁移校验...');
            validateDocumentStructure();
            isLoaded.value = true;
          }, 300);

        } else {
          initializeEmptyDocument();
          isLoaded.value = true;
        }
        isLoaded.value = true;
      }
      catch (e: any) {
        console.error('[Yjs] 异步加载失败，强制断开连接:');
        provider.disconnect();
        isLoaded.value = false;
        loadingPromise = null;
        throw e;
      }
    })();
    return loadingPromise;
  };

  // 初始化空文档结构
  function initializeEmptyDocument() {
    ydoc.transact(() => {
      // 为 Markdown 编辑器初始化 XmlFragment
      ydoc.get('prosemirror', Y.XmlFragment)

      // 如果需要，也可以为文本编辑器保留 Text 字段
      ydoc.getText('content')

      console.log('[Yjs] 已初始化空文档结构')
    }, 'initialize-empty')
  }

  // 验证文档结构是否正确
  function validateDocumentStructure() {
    ydoc.transact(() => {
      // 检查是否有旧的 Text 字段需要迁移
      const oldText = ydoc.getText('content')
      const fragment = ydoc.get('prosemirror', Y.XmlFragment)

      // 如果有旧的文本数据但 fragment 是空的，自动迁移
      if (oldText.length > 0 && fragment.length === 0) {
        console.log('[Yjs] 检测到旧格式数据，开始自动迁移...')
        try {
          // 将 Text 数据迁移到 XmlFragment
          const textContent = oldText.toString()
          if (textContent.trim()) {
            // 创建单个段落包含所有文本
            const paragraph = new Y.XmlElement('paragraph')
            paragraph.insert(0, [new Y.XmlText(textContent)])
            fragment.insert(0, [paragraph])
            console.log('[Yjs] 成功迁移文本到 XmlFragment')
          }

          // 清理旧的 Text 数据
          oldText.delete(0, oldText.length)
          console.log('[Yjs] 已清理旧的 Text 数据')
        } catch (migrationError) {
          console.error('[Yjs] 数据迁移失败:', migrationError)
        }
      } else if (oldText.length > 0) {
        console.log('[Yjs] 文档已经包含新格式数据，跳过迁移')
      } else {
        console.log('[Yjs] 文档为空或已经是新格式')
      }
    }, 'validate-structure')
  }

  return { ydoc, provider, isLoaded, loadHistoryAndConnect }
}
