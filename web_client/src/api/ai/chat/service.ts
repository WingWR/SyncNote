import api from '../../index'
import type { AIChatRequest, AIChatResponse, AIStreamCallbacks, ApiResponse } from './types'

export function chat(data: AIChatRequest) {
  return api.post<ApiResponse<AIChatResponse>>('/ai/chat', data)
}

export function chatStream(data: AIChatRequest, callbacks: AIStreamCallbacks) {
  // For now, implement a fallback using regular fetch with polling
  // In production, you'd want to use proper SSE or WebSocket

  console.log('[AI] Starting chat stream request:', data)
  console.log('[AI] Callbacks provided:', !!callbacks)
  console.log('[AI] onChunk callback:', typeof callbacks.onChunk)

  const pollForUpdates = async () => {
    try {
      console.log('[AI] Sending request to:', '/api/ai/chat/stream')
      console.log('[AI] Making fetch request with headers:', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [PRESENT]'
      })

      const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      console.log('[AI] Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        console.log('[AI] Read chunk:', { done, valueLength: value?.length })

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep the last potentially incomplete line
        buffer = lines.pop() || ''

        for (const line of lines) {
          console.log('[AI] Processing line:', line)
          console.log('[AI] Line starts with data::', line.startsWith('data: '))
          console.log('[AI] Line length:', line.length)

          if (line.includes('data:')) {
            try {
              const dataIndex = line.indexOf('data:')
              const jsonStr = line.substring(dataIndex + 5).trim() // Skip 'data:' and trim
              const chunk = JSON.parse(jsonStr)

              console.log('[AI] Processing chunk:', chunk)

              // Handle SSE format from backend
              if (chunk.delta !== undefined) {
                // This is a message chunk - send individual delta
                console.log('[AI] Delta received:', chunk.delta)
                callbacks.onChunk({
                  type: 'chunk',
                  content: chunk.delta, // Send individual delta, not accumulated content
                  done: false
                })
              } else if (chunk.done !== undefined) {
                // This is the done signal
                console.log('[AI] Stream completed')
                callbacks.onChunk({
                  type: 'done',
                  content: '',
                  done: true
                })
                callbacks.onComplete()
                return
              } else {
                console.warn('[AI] Unknown chunk type:', chunk)
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', line, e)
            }
          }
        }
      }
    } catch (error) {
      callbacks.onError(error as Error)
    }
  }

  // Start polling for updates
  pollForUpdates()

  // Return a cleanup function
  return () => {
    // Cleanup logic if needed
  }
}
