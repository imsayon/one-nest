import { useEffect, useRef } from 'react'
import type { SseEvent } from '@/types/agent'
import { useAppStore } from '@/store/app.store'

/**
 * Subscribes to the SSE stream for a given queryId.
 * Updates Zustand store as events arrive.
 * Cleans up on unmount.
 */
export function useQueryStream(queryId: string | null) {
  const esRef = useRef<EventSource | null>(null)
  const { markAgentStarted, markAgentCompleted, markAgentFailed, markQueryCompleted } =
    useAppStore()

  useEffect(() => {
    if (!queryId) return

    const es = new EventSource(`/api/query/${queryId}/stream`, {
      withCredentials: true,
    })

    esRef.current = es

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data as string) as SseEvent
        handleSseEvent(event)
      } catch {
        console.warn('Failed to parse SSE event:', e.data)
      }
    }

    es.addEventListener('agent_started', (e) => {
      try {
        const event = JSON.parse((e as MessageEvent<string>).data) as SseEvent
        if (event.agentId) markAgentStarted(event.agentId)
      } catch {}
    })

    es.addEventListener('agent_completed', (e) => {
      try {
        const event = JSON.parse((e as MessageEvent<string>).data) as SseEvent
        if (event.agentId && event.data) markAgentCompleted(event.agentId, event.data)
      } catch {}
    })

    es.addEventListener('agent_failed', (e) => {
      try {
        const event = JSON.parse((e as MessageEvent<string>).data) as SseEvent
        if (event.agentId && event.data) markAgentFailed(event.agentId, event.data)
      } catch {}
    })

    es.addEventListener('query_completed', () => {
      markQueryCompleted()
      es.close()
    })

    es.onerror = () => {
      console.error('SSE connection error for query:', queryId)
      markQueryCompleted()
      es.close()
    }

    function handleSseEvent(event: SseEvent) {
      switch (event.type) {
        case 'agent_started':
          if (event.agentId) markAgentStarted(event.agentId)
          break
        case 'agent_completed':
          if (event.agentId && event.data) markAgentCompleted(event.agentId, event.data)
          break
        case 'agent_failed':
          if (event.agentId && event.data) markAgentFailed(event.agentId, event.data)
          break
        case 'query_completed':
          markQueryCompleted()
          es.close()
          break
      }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [queryId, markAgentStarted, markAgentCompleted, markAgentFailed, markQueryCompleted])
}
