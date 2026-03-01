import axios from 'axios'
import type { QuerySubmitResponse, QueryResult, User } from '@/types/agent'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as { _retry?: boolean }
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await api.post('/auth/refresh')
        return api(original as Parameters<typeof api>[0])
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err instanceof Error ? err : new Error(String(err)))
  }
)

export const authApi = {
  register: (data: { email: string; password: string; fullName: string; homeCity?: string }) =>
    api.post<{ message: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ message: string }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
}

export const queryApi = {
  submit: (input: string) =>
    api.post<QuerySubmitResponse>('/query', { input }),
  getResult: (queryId: string) =>
    api.get<QueryResult>(`/query/${queryId}`),
  getHistory: () =>
    api.get<QueryResult[]>('/query'),
}

export const preferencesApi = {
  get: () => api.get('/preferences'),
  update: (data: Record<string, unknown>) => api.put('/preferences', data),
}

export default api
