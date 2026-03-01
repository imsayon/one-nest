import { create } from 'zustand'
import type { AgentResponse, User } from '@/types/agent'

interface AgentStatus {
  state: 'pending' | 'running' | 'completed' | 'failed'
  result?: AgentResponse
}

interface AppState {
  // Auth
  user: User | null
  setUser: (user: User | null) => void

  // Active query
  activeQueryId: string | null
  activeAgents: string[]
  agentStatuses: Record<string, AgentStatus>
  isQueryRunning: boolean
  queryCompleted: boolean

  // Actions
  startQuery: (queryId: string, agents: string[]) => void
  markAgentStarted: (agentId: string) => void
  markAgentCompleted: (agentId: string, result: AgentResponse) => void
  markAgentFailed: (agentId: string, result: AgentResponse) => void
  markQueryCompleted: () => void
  resetQuery: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  activeQueryId: null,
  activeAgents: [],
  agentStatuses: {},
  isQueryRunning: false,
  queryCompleted: false,

  startQuery: (queryId, agents) =>
    set({
      activeQueryId: queryId,
      activeAgents: agents,
      isQueryRunning: true,
      queryCompleted: false,
      agentStatuses: Object.fromEntries(
        agents.map((id) => [id, { state: 'pending' as const }])
      ),
    }),

  markAgentStarted: (agentId) =>
    set((s) => ({
      agentStatuses: {
        ...s.agentStatuses,
        [agentId]: { state: 'running' },
      },
    })),

  markAgentCompleted: (agentId, result) =>
    set((s) => ({
      agentStatuses: {
        ...s.agentStatuses,
        [agentId]: { state: 'completed', result },
      },
    })),

  markAgentFailed: (agentId, result) =>
    set((s) => ({
      agentStatuses: {
        ...s.agentStatuses,
        [agentId]: { state: 'failed', result },
      },
    })),

  markQueryCompleted: () => set({ isQueryRunning: false, queryCompleted: true }),

  resetQuery: () =>
    set({
      activeQueryId: null,
      activeAgents: [],
      agentStatuses: {},
      isQueryRunning: false,
      queryCompleted: false,
    }),
}))
