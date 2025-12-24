import * as Y from 'yjs'
import { debounce } from 'lodash-es'
import { updateDocumentState } from '../../../api/document'

export function useYjsAutoSave(ydoc: Y.Doc, docId: string, delay = 1000) {
    const uint8ArrayToBase64 = (arr: Uint8Array) => btoa(String.fromCharCode(...arr))
    let lastSavedState: string | null = null
    let isPaused = false

    // 经过delay时间没有操作，则自动和数据库同步
    const debouncedSave = debounce(async () => {
        // 如果已暂停，不执行保存
        if (isPaused) return

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
    const updateHandler = (_update: Uint8Array, origin: any) => {
        // 如果是初始化加载，不要触发保存，否则会造成死循环或无效请求
        if (origin === 'local-initial-load') return;

        debouncedSave();
    }
    ydoc.on('update', updateHandler);

    // 强制保存（不检查暂停状态）
    function flush() {
        debouncedSave.flush()
    }

    // 暂停自动保存
    function pause() {
        isPaused = true
        console.log(`[Yjs] 文档 ${docId} 自动保存已暂停`)
    }

    // 恢复自动保存
    function resume() {
        isPaused = false
        console.log(`[Yjs] 文档 ${docId} 自动保存已恢复`)
    }

    // 手动保存（强制执行，不受暂停状态影响）
    async function manualSave() {
        try {
            // 取消任何正在等待的自动保存
            debouncedSave.cancel()

            // 获取所有Yjs内容用于调试
            const ytext = ydoc.getText('content')
            const currentContent = ytext.toString()
            console.log(`[Yjs] 文档 ${docId} 当前Yjs内容:`, currentContent)
            console.log(`[Yjs] 文档 ${docId} Yjs内容长度:`, currentContent.length)

            const state = Y.encodeStateAsUpdate(ydoc)
            const docContent = uint8ArrayToBase64(state)

            console.log(`[Yjs] 文档 ${docId} 手动保存开始...`)
            console.log(`[Yjs] 状态大小: ${state.length}, Base64长度: ${docContent.length}`)
            console.log(`[Yjs] 编码后的前100字符:`, docContent.substring(0, 100))

            const response = await updateDocumentState(docId, { base64State: docContent })

            if (response.code === 200) {
                lastSavedState = docContent
                console.log(`[Yjs] 文档 ${docId} 手动保存成功`)
                return true
            } else {
                console.error(`[Yjs] 文档 ${docId} 手动保存失败:`, response)
                return false
            }
        } catch (error) {
            console.error(`[Yjs] 文档 ${docId} 手动保存失败:`, error)
            throw error
        }
    }

    function destroy() {
        flush()
        ydoc.off('update', updateHandler)
    }

    return { flush, pause, resume, manualSave, destroy }
}
