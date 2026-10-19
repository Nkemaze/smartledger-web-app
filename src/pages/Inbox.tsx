import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { inboxService } from '@/lib/api'
import type { WhatsappConversation, WhatsappMessage } from '@/lib/api'

function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay =
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  return sameDay
    ? d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function initialsFor(name: string | null, phone: string) {
  if (name) return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return phone.slice(-2)
}

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: WhatsappConversation
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-md px-lg py-4 border-b border-outline-variant/5 transition-colors ${
        active ? 'bg-secondary-container' : 'hover:bg-surface-container-low'
      }`}
    >
      <Avatar initials={initialsFor(conv.contactName, conv.contactPhone)} className="bg-primary/10 text-primary" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-label text-label-md font-bold text-on-surface truncate">
            {conv.contactName ?? `+${conv.contactPhone}`}
          </p>
          <span className="text-[11px] text-on-surface-variant flex-shrink-0">{formatTime(conv.lastAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-[13px] text-on-surface-variant truncate">
            {conv.lastDirection === 'OUTBOUND' ? 'You: ' : ''}
            {conv.lastMessage}
          </p>
          {conv.unreadCount > 0 && (
            <span className="bg-primary text-on-primary text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function MessageBubble({ message }: { message: WhatsappMessage }) {
  const outbound = message.direction === 'OUTBOUND'
  return (
    <div className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
          outbound
            ? 'bg-primary text-on-primary rounded-br-md'
            : 'bg-surface-container text-on-surface rounded-bl-md'
        }`}
      >
        <p className="text-body-md whitespace-pre-wrap break-words">{message.text}</p>
        <div className={`flex items-center gap-1 mt-1 text-[10px] ${outbound ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {outbound && (
            <Icon
              name={message.status === 'read' ? 'done_all' : message.status === 'delivered' ? 'done_all' : 'done'}
              className="text-[13px]"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function Inbox() {
  const [conversations, setConversations] = useState<WhatsappConversation[]>([])
  const [activePhone, setActivePhone] = useState<string | null>(null)
  const [messages, setMessages] = useState<WhatsappMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)

  const loadConversations = async () => {
    try {
      setConversations(await inboxService.conversations())
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load conversations.')
    } finally {
      setLoadingList(false)
    }
  }

  const openThread = async (phone: string) => {
    setActivePhone(phone)
    setLoadingThread(true)
    try {
      setMessages(await inboxService.thread(phone))
      await loadConversations() // refresh unread badges
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load messages.')
    } finally {
      setLoadingThread(false)
    }
  }

  const send = async () => {
    if (!activePhone || !draft.trim() || sending) return
    setSending(true)
    try {
      const created = await inboxService.send(activePhone, draft)
      setMessages((prev) => [...prev, created])
      setDraft('')
      await loadConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send.')
    } finally {
      setSending(false)
    }
  }

  // Poll conversations while the inbox is open so new inbound messages appear.
  useEffect(() => {
    loadConversations()
    const id = setInterval(loadConversations, 10000)
    return () => clearInterval(id)
  }, [])

  // Re-poll the open thread for new inbound replies.
  useEffect(() => {
    if (!activePhone) return
    const id = setInterval(async () => {
      try {
        setMessages(await inboxService.thread(activePhone))
      } catch {
        /* ignore transient poll errors */
      }
    }, 8000)
    return () => clearInterval(id)
  }, [activePhone])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const activeConv = conversations.find((c) => c.contactPhone === activePhone)

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">WhatsApp Inbox</h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Messages sent to your business WhatsApp number
          </p>
        </div>
        <Badge tone="success" dot>
          Live
        </Badge>
      </div>

      {error && (
        <div className="bg-error-container/40 rounded-xl px-lg py-md text-body-sm text-error">{error}</div>
      )}

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[600px]">
          {/* Conversation list */}
          <div className={`border-r border-outline-variant/5 overflow-y-auto ${activePhone ? 'hidden md:block' : ''}`}>
            {loadingList ? (
              <div className="p-xl text-center text-body-sm text-on-surface-variant">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-xl text-center space-y-2">
                <Icon name="forum" className="text-[40px] text-outline" />
                <p className="text-body-md text-on-surface-variant">No messages yet</p>
                <p className="text-body-sm text-outline">
                  Messages your customers send to your WhatsApp number will appear here.
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationRow
                  key={conv.contactPhone}
                  conv={conv}
                  active={conv.contactPhone === activePhone}
                  onClick={() => openThread(conv.contactPhone)}
                />
              ))
            )}
          </div>

          {/* Thread */}
          <div className={`flex flex-col ${activePhone ? '' : 'hidden md:flex'}`}>
            {!activePhone ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <Icon name="chat" className="text-[48px] text-outline" />
                <p className="text-body-md">Select a conversation</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-md px-lg py-4 border-b border-outline-variant/5">
                  <button
                    className="md:hidden p-1 text-on-surface-variant"
                    onClick={() => setActivePhone(null)}
                    aria-label="Back"
                  >
                    <Icon name="arrow_back" />
                  </button>
                  <Avatar
                    initials={initialsFor(activeConv?.contactName ?? null, activePhone)}
                    className="bg-primary/10 text-primary"
                  />
                  <div>
                    <p className="font-label text-label-md font-bold text-on-surface">
                      {activeConv?.contactName ?? `+${activePhone}`}
                    </p>
                    <p className="text-[12px] text-on-surface-variant">+{activePhone}</p>
                  </div>
                </div>

                <div ref={threadRef} className="flex-1 overflow-y-auto px-lg py-5 space-y-3 bg-surface-container-low/30">
                  {loadingThread ? (
                    <div className="text-center text-body-sm text-on-surface-variant">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-body-sm text-on-surface-variant">No messages in this thread.</div>
                  ) : (
                    messages.map((m) => <MessageBubble key={m.id} message={m} />)
                  )}
                </div>

                <div className="flex items-center gap-sm px-lg py-4 border-t border-outline-variant/5">
                  <input
                    className="flex-1 h-11 px-md bg-surface border-l-2 border-l-transparent focus:border-l-primary outline-none rounded-md font-body text-body-md text-on-surface"
                    placeholder="Type a reply…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={sending || !draft.trim()}
                    className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
                    aria-label="Send"
                  >
                    <Icon name="send" className="text-[20px]" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
