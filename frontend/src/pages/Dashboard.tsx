import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryApi, authApi } from '@/lib/api'
import { useAppStore } from '@/store/app.store'
import { useQueryStream } from '@/hooks/useQueryStream'
import type { AgentResponse, QueryResult } from '@/types/agent'
import { AGENT_META } from '@/types/agent'
import { useNavigate } from 'react-router-dom'

// ────────────────────────────────────────────────────────── Agent Card
function AgentCard({ agentId, state, result }: {
  agentId: string
  state: 'pending' | 'running' | 'completed' | 'failed'
  result?: AgentResponse
}) {
  const meta = AGENT_META[agentId] ?? { label: agentId, icon: '🤖', color: '#fff', gradient: '', description: '' }
  const [confirming, setConfirming] = useState<string | null>(null)

  function handleAction(label: string) {
    setConfirming(label)
    setTimeout(() => setConfirming(null), 2500)
  }

  return (
    <div className={`agent-card ${state}`}>
      <div className="agent-card-header">
        <div className="agent-card-title">
          <div className="agent-icon-badge" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}>
            {meta.icon}
          </div>
          <div>
            <div className="agent-name">{meta.label}</div>
            <div className="agent-sub">{meta.description}</div>
          </div>
        </div>
        <div className={`agent-status-pill status-${state}`}>
          {state === 'running' && <span className="spinner" />}
          {state === 'pending' && '⏳'}
          {state === 'completed' && '✓'}
          {state === 'failed' && '✗'}
          {state}
        </div>
      </div>

      {/* Body */}
      <div className="agent-card-body">
        {state === 'pending' && (
          <div className="agent-card-empty">Waiting to start...</div>
        )}
        {state === 'running' && (
          <div className="agent-card-empty" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
          </div>
        )}
        {(state === 'completed' || state === 'failed') && result && (
          <AgentCardContent agentId={agentId} result={result} />
        )}
      </div>

      {/* Actions */}
      {result && result.actions.length > 0 && (
        <div className="agent-card-actions">
          {result.actions.map((action) => (
            <button
              key={action.actionId}
              className={`action-btn ${action.type === 'booking' ? 'booking' : ''}`}
              onClick={() => handleAction(action.label)}
              title={action.estimatedCost ? `Est. ₹${action.estimatedCost.toLocaleString()}` : undefined}
            >
              {confirming === action.label ? '✓ Saved!' : action.label}
            </button>
          ))}
        </div>
      )}

      {/* Confidence bar */}
      {result && result.status === 'success' && (
        <div className="confidence-bar" style={{ margin: '0 16px 12px' }}>
          <div
            className="confidence-bar-fill"
            style={{
              width: `${Math.round(result.confidence * 100)}%`,
              background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────── Agent Content
function AgentCardContent({ agentId, result }: { agentId: string; result: AgentResponse }) {
  if (result.status === 'error') {
    return <div style={{ color: 'var(--error)', fontSize: 13 }}>⚠️ {result.error ?? 'Agent failed'}</div>
  }

  const data = result.data as Record<string, unknown> | null
  if (!data) return <div className="agent-card-empty">No data returned</div>

  // Agent-specific rendering
  if (agentId === 'travel') return <TravelCardContent data={data} />
  if (agentId === 'calendar') return <CalendarCardContent data={data} />
  if (agentId === 'music') return <MusicCardContent data={data} />
  if (agentId === 'wardrobe') return <WardrobeCardContent data={data} />
  if (agentId === 'food') return <FoodCardContent data={data} />
  if (agentId === 'accommodation') return <AccomCardContent data={data} />
  if (agentId === 'finance') return <FinanceCardContent data={data} />
  if (agentId === 'meeting-prep') return <MeetingCardContent data={data} />

  return (
    <pre style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'auto', maxHeight: 140 }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function TravelCardContent({ data }: { data: Record<string, unknown> }) {
  const flights = (data.flights as Array<Record<string, unknown>>) ?? []
  const weather = data.weather as Record<string, unknown> | null
  return (
    <div>
      {weather && (
        <div className="data-row">
          <span className="data-key">Weather</span>
          <span className="data-value">{weather.temperatureCelsius as number}°C · {weather.description as string}</span>
        </div>
      )}
      {flights.slice(0, 3).map((f, i) => (
        <div key={i} className="data-row">
          <span className="data-key">{f.airline as string} {f.flightNumber as string}</span>
          <span className="data-value">₹{(f.price as number).toLocaleString()} · {f.duration as string}</span>
        </div>
      ))}
    </div>
  )
}

function CalendarCardContent({ data }: { data: Record<string, unknown> }) {
  const event = data.event as Record<string, unknown>
  return (
    <div>
      <div className="data-row">
        <span className="data-key">Event</span>
        <span className="data-value">{event.title as string}</span>
      </div>
      <div className="data-row">
        <span className="data-key">Time</span>
        <span className="data-value">{new Date(event.startDateTime as string).toLocaleString()}</span>
      </div>
      {Boolean(data.travelReminder) && (
        <div className="data-row">
          <span className="data-key">Travel Reminder</span>
          <span className="data-value" style={{ color: 'var(--accent-light)' }}>Added ✓</span>
        </div>
      )}
    </div>
  )
}

function MusicCardContent({ data }: { data: Record<string, unknown> }) {
  const tracks = (data.tracks as Array<Record<string, unknown>>) ?? []
  return (
    <div>
      <div className="data-row">
        <span className="data-key">Playlist</span>
        <span className="data-value" style={{ color: '#1DB954' }}>{data.playlistName as string}</span>
      </div>
      <div className="data-row">
        <span className="data-key">Mood</span>
        <span className="data-value">{data.mood as string}</span>
      </div>
      {tracks.slice(0, 3).map((t, i) => (
        <div key={i} className="data-row">
          <span className="data-key" style={{ fontSize: 11 }}>{t.name as string}</span>
          <span className="data-value" style={{ fontSize: 11 }}>{t.artist as string}</span>
        </div>
      ))}
    </div>
  )
}

function WardrobeCardContent({ data }: { data: Record<string, unknown> }) {
  const outfit = data.recommendedOutfit as Record<string, string>
  return (
    <div>
      <div className="data-row"><span className="data-key">Top</span><span className="data-value">{outfit.top}</span></div>
      <div className="data-row"><span className="data-key">Bottom</span><span className="data-value">{outfit.bottom}</span></div>
      <div className="data-row"><span className="data-key">Shoes</span><span className="data-value">{outfit.footwear}</span></div>
      <div className="data-row"><span className="data-key">Climate Note</span><span className="data-value" style={{ fontSize: 11 }}>{data.weatherConsideration as string}</span></div>
    </div>
  )
}

function FoodCardContent({ data }: { data: Record<string, unknown> }) {
  const breakfast = (data.breakfastOptions as Array<Record<string, unknown>>) ?? []
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>BREAKFAST</div>
      {breakfast.slice(0, 2).map((r, i) => (
        <div key={i} className="data-row">
          <span className="data-key">{r.name as string}</span>
          <span className="data-value">⭐ {r.rating as number} · {r.priceRange as string}</span>
        </div>
      ))}
    </div>
  )
}

function AccomCardContent({ data }: { data: Record<string, unknown> }) {
  const options = (data.options as Array<Record<string, unknown>>) ?? []
  return (
    <div>
      <div className="data-row">
        <span className="data-key">Recommended</span>
        <span className="data-value" style={{ color: 'var(--accent-light)' }}>{data.recommended as string}</span>
      </div>
      {options.slice(0, 2).map((h, i) => (
        <div key={i} className="data-row">
          <span className="data-key">{h.name as string} {'⭐'.repeat(Math.min((h.starRating as number), 5))}</span>
          <span className="data-value">₹{(h.pricePerNight as number).toLocaleString()}/night</span>
        </div>
      ))}
    </div>
  )
}

function FinanceCardContent({ data }: { data: Record<string, unknown> }) {
  const breakdown = (data.breakdown as Array<Record<string, unknown>>) ?? []
  return (
    <div>
      {breakdown.slice(0, 4).map((b, i) => (
        <div key={i} className="data-row">
          <span className="data-key">{b.category as string}</span>
          <span className="data-value">₹{(b.estimatedCost as number).toLocaleString()}</span>
        </div>
      ))}
      <div className="data-row" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 6 }}>
        <span className="data-key" style={{ fontWeight: 600 }}>Total</span>
        <span className="data-value" style={{ color: '#34d399', fontWeight: 700 }}>₹{(data.totalEstimate as number).toLocaleString()}</span>
      </div>
    </div>
  )
}

function MeetingCardContent({ data }: { data: Record<string, unknown> }) {
  const points = (data.talkingPoints as string[]) ?? []
  return (
    <div>
      {points.slice(0, 3).map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          • {p}
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────── Dashboard
const EXAMPLE_QUERIES = [
  "I have a meeting on 2nd March 2026 at the Oberoi's, Mumbai",
  "Planning a weekend trip to Goa next Friday",
  "Board presentation in Bangalore on 15th March",
]

export default function Dashboard() {
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()
  const { user, setUser, activeQueryId, activeAgents, agentStatuses, isQueryRunning, startQuery, resetQuery } = useAppStore()

  // Subscribe to SSE if there's an active query
  useQueryStream(activeQueryId)

  // Load history
  const { data: history, refetch: refetchHistory } = useQuery<QueryResult[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const r = await queryApi.getHistory()
      return r.data
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (!user) {
      authApi.me().then(({ data }) => setUser(data)).catch(() => navigate('/login'))
    }
  }, [user, setUser, navigate])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  async function handleSubmit() {
    if (!input.trim() || submitting || isQueryRunning) return
    setSubmitting(true)
    resetQuery()

    try {
      const { data } = await queryApi.submit(input.trim())
      startQuery(data.queryId, data.agentsActivated)
      setInput('')
      void refetchHistory()
    } catch {
      // handle error
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit()
    }
  }

  async function handleLogout() {
    await authApi.logout()
    setUser(null)
    navigate('/login')
  }

  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? '?'

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🪺</div>
          <h2>One-Nest</h2>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          <a className="sidebar-item active" href="#">
            <span className="sidebar-item-icon">⚡</span> Dashboard
          </a>
          <a className="sidebar-item" href="#">
            <span className="sidebar-item-icon">🕐</span> History
          </a>
          <a className="sidebar-item" href="#">
            <span className="sidebar-item-icon">⚙️</span> Preferences
          </a>
        </div>

        <div className="sidebar-section" style={{ marginTop: 12 }}>
          <div className="sidebar-section-label">Agents</div>
          {Object.entries(AGENT_META).map(([id, meta]) => (
            <div key={id} className="sidebar-item" style={{ fontSize: 12 }}>
              <span className="sidebar-item-icon">{meta.icon}</span>
              {meta.label}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName ?? 'User'}</div>
              <div className="user-email">{user?.email ?? ''}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => void handleLogout()}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* Query Bar */}
        <div className="query-bar">
          <h1>What's on your mind? One-Nest handles the rest.</h1>
          <div className="query-input-wrapper">
            <textarea
              ref={textareaRef}
              className="query-textarea"
              placeholder="e.g. I have a meeting on 2nd March 2026 at the Oberoi's, Mumbai"
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize() }}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="btn-submit"
              disabled={!input.trim() || submitting || isQueryRunning}
              onClick={() => void handleSubmit()}
              title="Submit (Ctrl+Enter)"
            >
              {submitting || isQueryRunning ? <span className="spinner" style={{ borderColor: 'white', borderTopColor: 'transparent' }} /> : '↑'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Ctrl+Enter to submit · {activeAgents.length > 0 && `${activeAgents.length} agents running`}
          </div>
        </div>

        {/* Agent Grid / Empty State */}
        <div className="agent-grid-area">
          {activeAgents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🪺</div>
              <h2>Your AI fleet is ready</h2>
              <p>
                Type a natural language query above and One-Nest will dispatch 8 specialized
                AI agents simultaneously — travel, calendar, music, wardrobe, food, accommodation,
                finance, and meeting prep.
              </p>
              <div className="example-queries">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    className="example-query"
                    onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="agents-grid">
              {activeAgents.map((agentId) => {
                const status = agentStatuses[agentId]
                return (
                  <AgentCard
                    key={agentId}
                    agentId={agentId}
                    state={status?.state ?? 'pending'}
                    result={status?.result}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── History Panel ── */}
      <aside className="history-panel">
        <div className="history-header">Recent Queries</div>
        <div className="history-list">
          {!history?.length && (
            <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '16px 12px' }}>
              No history yet. Submit your first query!
            </div>
          )}
          {history?.map((q) => (
            <div key={q.id} className={`history-item${activeQueryId === q.id ? ' active' : ''}`}>
              <div className="history-item-input">{q.rawInput}</div>
              <div className="history-item-meta">
                {new Date(q.createdAt).toLocaleDateString()} · {q.agentResults?.length ?? 0} agents
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
