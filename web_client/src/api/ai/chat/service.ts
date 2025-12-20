import api from '../../index'
import type { AIChatRequest, AIChatResponse, AIStreamCallbacks } from './types'

export function chat(data: AIChatRequest) {
  return api.post<AIChatResponse>('/ai/chat', data)
}

export function chatStream(data: AIChatRequest, callbacks: AIStreamCallbacks) {
  // For now, implement a fallback using regular fetch with polling
  // In production, you'd want to use proper SSE or WebSocket

  let fullContent = ''

  const pollForUpdates = async () => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
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

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep the last potentially incomplete line
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(line.substring(6))
              fullContent += chunk.content

              if (chunk.type === 'chunk') {
                callbacks.onChunk({
                  type: 'chunk',
                  content: fullContent,
                  done: false
                })
              } else if (chunk.type === 'done') {
                callbacks.onChunk({
                  type: 'done',
                  content: fullContent,
                  done: true
                })
                callbacks.onComplete()
                return
              } else if (chunk.type === 'error') {
                callbacks.onError(new Error(chunk.content))
                return
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
