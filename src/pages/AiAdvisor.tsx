import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { advisorService, type ChatMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth/AuthContext'
import type { AdvisorInsight } from '@/lib/api'

const typeMeta: Record<AdvisorInsight['type'], { icon: string; iconClass: string }> = {
  low_stock: { icon: 'inventory_2', iconClass: 'bg-primary/10 text-primary' },
  cashflow: { icon: 'payments', iconClass: 'bg-error/10 text-error' },
  tax: { icon: 'receipt_long', iconClass: 'bg-warning/10 text-warning' },
  sales: { icon: 'trending_up', iconClass: 'bg-tertiary/10 text-tertiary' },
  inventory: { icon: 'inventory_2', iconClass: 'bg-primary/10 text-primary' },
}

const severityMeta: Record<AdvisorInsight['severity'], { badge: string; badgeTone: 'error' | 'warning' | 'info' | 'success'; actionClass: string }> = {
  critical: { badge: 'Critical Alert', badgeTone: 'error', actionClass: 'bg-error text-on-primary hover:bg-error-container shadow-lg shadow-error/25' },
  warning: { badge: 'Needs Attention', badgeTone: 'warning', actionClass: 'bg-warning text-on-primary hover:bg-warning-container shadow-lg shadow-warning/25' },
  info: { badge: 'Insight', badgeTone: 'info', actionClass: 'bg-primary text-on-primary hover:bg-primary-container shadow-lg shadow-primary/25' },
}

type ChatEntry = ChatMessage & { source?: 'ai' | 'offline' }

function InsightCard({
  icon,
  iconClass,
  badge,
  badgeTone,
  title,
  children,
  action,
  actionClass = '',
}: {
  icon: string
  iconClass: string
  badge: string
  badgeTone: 'error' | 'success' | 'warning' | 'info'
  title: string
  children: React.ReactNode
  action: React.ReactNode
  actionClass?: string
}) {
  return (
    <Card className="p-xl flex flex-col gap-lg h-full">
      <div className="flex items-center justify-between">
        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconClass}`}>
          <Icon name={icon} className="text-[24px]" />
        </span>
        <Badge tone={badgeTone} pulse={badgeTone === 'error'}>
          {badge}
        </Badge>
      </div>
      <h3 className="font-headline text-headline-md text-on-surface">{title}</h3>
      <div className="flex-1">{children}</div>
      <button className={`flex items-center gap-2 h-11 px-lg rounded-xl font-label text-label-md font-bold transition-colors w-fit ${actionClass}`}>
        {action}
      </button>
    </Card>
  )
}

export function AiAdvisor() {
  const { user, business } = useAuth()
  const [insights, setInsights] = useState<AdvisorInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your SmartLedger advisor. Ask me anything about your sales, inventory, or taxes.",
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const historyRef = useRef<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const firstName = (user?.name ?? 'there').split(' ')[0]

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await advisorService.insights()
      setInsights(data.insights ?? [])
      setLastSync(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const confidence = useMemo(() => {
    let score = 45
    if (business?.name) score += 10
    if (business?.shopType) score += 5
    if (business?.currency) score += 5
    if (business?.taxId) score += 10
    if (business?.address) score += 5
    if (business?.phone) score += 5
    if (!loading) score += 10
    if (insights.length > 0) score += 5
    return Math.min(Math.max(score, 0), 99)
  }, [business, insights, loading])

  const syncLabel = lastSync
    ? lastSync.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    : '—'

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setChatError('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setSending(true)
    try {
      const data = await advisorService.chat(text, historyRef.current.slice(-20))
      historyRef.current = [...historyRef.current, { role: 'user', content: text }, { role: 'assistant', content: data.reply }]
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, source: data.source }])
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Unable to reach the advisor.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>AI Intelligence Suite</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Business Advisor</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">
            Good morning, <span className="text-primary">{firstName}</span>.
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1 max-w-2xl">
            I've analyzed your store's performance overnight. Here are the most critical insights requiring your
            attention today.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="bg-surface-container-lowest rounded-xl px-lg py-3 shadow-sm text-center">
            <p className="font-headline text-title-lg text-primary">{confidence.toFixed(1)}%</p>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Data Confidence</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl px-lg py-3 shadow-sm text-center">
            <p className="font-headline text-title-lg text-on-surface flex items-center gap-1">
              {lastSync ? (
                <span className="w-2 h-2 bg-primary rounded-full" />
              ) : (
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
              {syncLabel}
            </p>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Last Sync</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-lg bg-error-container/40 rounded-xl px-lg py-md">
          <div className="flex items-center gap-2">
            <Icon name="error_outline" className="text-error" />
            <p className="font-body text-body-sm text-error">{error}</p>
          </div>
          <button className="font-label text-label-md text-error font-bold hover:underline" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : insights.length === 0 ? (
        <Card className="p-xl flex flex-col items-center justify-center text-center gap-md min-h-[240px] bg-gradient-to-br from-secondary-container/20 to-primary-container/20">
          <span className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="auto_awesome" className="text-[28px] text-primary" />
          </span>
          <div>
            <p className="font-label text-label-md font-bold text-on-surface mb-1">All clear</p>
            <p className="font-body text-body-md text-on-surface-variant">
              No urgent insights right now. I'll flag anything that needs your attention as soon as it appears.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {insights.map((insight) => {
            const type = typeMeta[insight.type] ?? typeMeta.cashflow
            const sev = severityMeta[insight.severity] ?? severityMeta.info
            return (
              <InsightCard
                key={insight.id}
                icon={type.icon}
                iconClass={type.iconClass}
                badge={sev.badge}
                badgeTone={sev.badgeTone}
                title={insight.title}
                actionClass={sev.actionClass}
                action={
                  <>
                    {insight.recommendation ?? 'View Details'}
                    <Icon name="arrow_forward" />
                  </>
                }
              >
                <p className="font-body text-body-md text-on-surface">{insight.message}</p>
                {insight.recommendation && (
                  <p className="font-body text-body-md text-on-surface-variant mt-2">
                    <span className="font-bold text-on-surface">Recommended:</span> {insight.recommendation}
                  </p>
                )}
              </InsightCard>
            )
          })}
        </div>
      )}

      <Card className="p-xl">
        <div className="flex items-center gap-lg mb-lg">
          <span className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="auto_awesome" className="text-on-primary" />
          </span>
          <div>
            <p className="font-label text-label-md font-bold text-on-surface">Ask your advisor</p>
            <p className="font-body text-body-sm text-on-surface-variant">
              Natural-language answers from your live data
            </p>
          </div>
          <div className="ml-auto hidden sm:block">
            {messages.some((m) => m.source === 'ai') ? (
              <Badge tone="success">Powered by AI</Badge>
            ) : (
              <Badge tone="info">Assistant</Badge>
            )}
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto space-y-md mb-lg pr-1">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-lg py-md font-body text-body-md whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-sm'
                    : 'bg-surface-container-low rounded-bl-sm text-on-surface'
                }`}
              >
                {msg.source === 'ai' && (
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider mb-1 opacity-60">
                    AI Advisor
                  </p>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-surface-container-low rounded-2xl rounded-bl-sm px-lg py-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:100ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:200ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {chatError && (
          <p className="flex items-center gap-2 font-body text-body-sm text-error mb-md">
            <Icon name="error_outline" className="text-[18px]" />
            {chatError}
          </p>
        )}

        <form
          className="flex items-center gap-md bg-surface-container-low rounded-full px-lg py-3"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <input
            className="flex-1 bg-transparent outline-none font-body text-body-md text-on-surface placeholder:text-outline/60"
            placeholder="Ask about your business, inventory, or tax..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={sending || !input.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Icon name="send" className="text-[18px]" />
          </button>
        </form>
      </Card>
    </div>
  )
}
