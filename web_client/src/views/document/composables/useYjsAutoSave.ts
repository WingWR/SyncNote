import * as Y from 'yjs'
import { debounce } from 'lodash-es'
import { updateDocumentState } from '../../../api/document/service'

export function useYjsAutoSave(ydoc: Y.Doc, docId: string, delay = 3000) {
    const uint8ArrayToBase64 = (arr: Uint8Array) => btoa(String.fromCharCode(...arr))
    let lastSavedState: string | null = null

    // 经过delay时间没有操作，则自动和数据库同步
    const debouncedSave = debounce(async () => {
        // 导出当前 ydoc 的完整状态快照
        const state = Y.encodeStateAsUpdate(ydoc)
        const docContent = uint8ArrayToBase64(state)

        // 只有在内容真正变化时才请求后端，减少网络开销
        if (docContent !== lastSavedState) {
            try {
                await updateDocumentState(docId, { base64State: docContent })
                lastSavedState = docContent
                console.log(`[Yjs] 文档 ${docId} 自动保存成功`)
            } catch (error) {
                console.error('[Yjs] 自动保存失败:', error)
            }
        }
    }, delay)

    // 监听 ydoc 更新
    ydoc.on('update', (_update, origin) => {
        // 如果是初始化加载，不要触发保存，否则会造成死循环或无效请求
        if (origin === 'local-initial-load') return;

        debouncedSave();
    });

    // 强制保存并解绑
    function flush() {
        debouncedSave.flush()
    }

    function destroy() {
        flush()
        ydoc.off('update', debouncedSave)
    }

    return { flush, destroy }
}
