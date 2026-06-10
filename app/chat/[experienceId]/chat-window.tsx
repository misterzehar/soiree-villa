'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { Send, Trash2, Flag, Image as ImageIcon, X } from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase-client'
import { sendMessage, deleteMessage, reportParticipant, markRead } from './actions'
import type { MessageWithSender } from './page'

type Props = {
  conversationId: string
  experienceId: string
  initialMessages: MessageWithSender[]
  currentUserId: string
  currentUserName: string
  isOrganizer: boolean
  organizerUserId: string
  organizerName: string
  lastReadAt: string | null
  isAfterglowExpired: boolean
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function ChatWindow({
  conversationId,
  experienceId,
  initialMessages,
  currentUserId,
  currentUserName,
  isOrganizer,
  organizerUserId,
  organizerName,
  lastReadAt,
  isAfterglowExpired,
}: Props) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [input, setInput] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [reportTarget, setReportTarget] = useState<{ userId: string; name: string } | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileCache = useRef<Record<string, string>>({})

  // Populate profile cache from initial messages
  useEffect(() => {
    for (const m of initialMessages) {
      if (!profileCache.current[m.sender_id]) {
        profileCache.current[m.sender_id] = m.sender_name
      }
    }
  }, [initialMessages])

  // Mark as read on mount
  useEffect(() => {
    markRead(conversationId).catch(() => undefined)
  }, [conversationId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClientSupabase()

    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newRow = payload.new as Omit<MessageWithSender, 'sender_name' | 'is_organizer_message'>

          // Resolve sender name
          let senderName = profileCache.current[newRow.sender_id]
          if (!senderName) {
            const { data } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', newRow.sender_id)
              .single()
            senderName = data?.display_name ?? 'Participant'
            profileCache.current[newRow.sender_id] = senderName
          }

          const msg: MessageWithSender = {
            ...newRow,
            sender_name: senderName,
            is_organizer_message: newRow.sender_id === organizerUserId,
          }

          setMessages(prev => {
            // Remove matching temp message from same sender with same content
            const withoutTemp = prev.filter(m => {
              if (!m.id.startsWith('tmp-')) return true
              if (m.sender_id !== newRow.sender_id) return true
              return false
            })
            if (withoutTemp.find(m => m.id === msg.id)) return withoutTemp
            return [...withoutTemp, msg]
          })

          markRead(conversationId).catch(() => undefined)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as Omit<MessageWithSender, 'sender_name' | 'is_organizer_message'>
          setMessages(prev =>
            prev.map(m =>
              m.id === updated.id
                ? { ...m, deleted_at: updated.deleted_at, content: updated.content, photo_url: updated.photo_url }
                : m,
            ),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, organizerUserId])

  const handleSend = useCallback(async () => {
    const content = input.trim()
    if (!content && !photoFile) return

    setSendError(null)
    let uploadedUrl: string | undefined

    // Upload photo if any
    if (photoFile) {
      const supabase = createClientSupabase()
      const path = `${currentUserId}/${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { data: uploaded, error: uploadErr } = await supabase.storage
        .from('chat-photos')
        .upload(path, photoFile, { upsert: false })

      if (uploadErr || !uploaded) {
        setUploadError('Impossible d\'envoyer la photo.')
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('chat-photos').getPublicUrl(uploaded.path)
      uploadedUrl = publicUrl
    }

    // Optimistic insert
    const tempId = `tmp-${Date.now()}`
    const tempMsg: MessageWithSender = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content || null,
      photo_url: uploadedUrl ?? null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      sender_name: currentUserName,
      is_organizer_message: isOrganizer,
    }

    setMessages(prev => [...prev, tempMsg])
    setInput('')
    setPhotoFile(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    startTransition(async () => {
      const result = await sendMessage(conversationId, experienceId, content, uploadedUrl)
      if (result?.error) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        setSendError(result.error)
      }
    })
  }, [input, photoFile, currentUserId, currentUserName, isOrganizer, conversationId, experienceId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDelete = (messageId: string) => {
    startTransition(async () => {
      const result = await deleteMessage(messageId, experienceId)
      if (result?.error) setSendError(result.error)
    })
  }

  const handleReport = async () => {
    if (!reportTarget || !reportReason.trim()) return
    const result = await reportParticipant(reportTarget.userId, conversationId, reportReason)
    if (result?.error) {
      setSendError(result.error)
    } else {
      setReportSent(true)
      setTimeout(() => {
        setReportTarget(null)
        setReportReason('')
        setReportSent(false)
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col flex-1 max-w-lg mx-auto w-full px-4">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 min-h-0" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-text-muted text-sm text-center">
              Aucun message pour le moment.<br />Soyez le premier à écrire !
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId
          const isOrganizerMsg = msg.is_organizer_message
          const isDeleted = !!msg.deleted_at
          const isUnread = lastReadAt ? new Date(msg.created_at) > new Date(lastReadAt) : false

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
            >
              {/* Sender name */}
              {!isOwn && (
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-xs font-medium text-text-muted">{msg.sender_name}</span>
                  {isOrganizerMsg && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      Organisateur
                    </span>
                  )}
                </div>
              )}

              {/* Bubble */}
              <div className={`group relative max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isDeleted
                      ? 'bg-surface border border-border text-text-muted italic'
                      : isOwn
                        ? 'bg-primary text-white rounded-br-sm'
                        : isOrganizerMsg
                          ? 'bg-secondary/15 text-text border border-secondary/20 rounded-bl-sm'
                          : 'bg-surface text-text rounded-bl-sm'
                  } ${isUnread && !isOwn ? 'ring-1 ring-primary/20' : ''}`}
                >
                  {isDeleted ? (
                    <span>Message supprimé</span>
                  ) : (
                    <>
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                      {msg.photo_url && (
                        <img
                          src={msg.photo_url}
                          alt="Photo"
                          className="max-w-full rounded-xl mt-1 max-h-60 object-cover"
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Actions (hover) */}
                {!isDeleted && (
                  <div className={`absolute ${isOwn ? 'right-full mr-1' : 'left-full ml-1'} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1`}>
                    {isOrganizer && !isOwn && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-error hover:border-error/30 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!isOwn && (
                      <button
                        onClick={() => setReportTarget({ userId: msg.sender_id, name: msg.sender_name })}
                        className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-warning hover:border-warning/30 transition-colors"
                        title="Signaler"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-text-muted px-1">
                {formatTime(msg.created_at)}
              </span>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {sendError && (
        <div className="mb-2 bg-error/10 border border-error/25 rounded-xl px-4 py-2 flex items-center justify-between">
          <p className="text-error text-xs">{sendError}</p>
          <button onClick={() => setSendError(null)} className="text-error/60 hover:text-error">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Photo preview */}
      {photoFile && (
        <div className="mb-2 flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2">
          <ImageIcon className="w-4 h-4 text-text-muted shrink-0" />
          <span className="text-xs text-text truncate flex-1">{photoFile.name}</span>
          <button
            onClick={() => { setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
            className="text-text-muted hover:text-text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {uploadError && <p className="text-error text-xs mb-2 px-1">{uploadError}</p>}

      {/* Input area */}
      {isAfterglowExpired ? (
        <div className="pb-6 pt-2 text-center">
          <p className="text-text-muted text-sm bg-surface rounded-2xl px-4 py-3">
            Le chat de cette soirée est fermé (30 jours après l'événement).
          </p>
        </div>
      ) : (
        <div className="pb-6 pt-2">
          <div className="flex items-end gap-2 bg-surface border border-border rounded-2xl px-3 py-2 focus-within:border-primary/40 transition-colors">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-text-muted hover:text-text transition-colors shrink-0 mb-0.5"
              title="Joindre une photo"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f && f.size <= 5 * 1024 * 1024) {
                  setPhotoFile(f)
                  setUploadError(null)
                } else if (f) {
                  setUploadError('Photo trop lourde (max 5 Mo).')
                }
              }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écris un message…"
              rows={1}
              className="flex-1 bg-transparent text-text text-sm placeholder:text-text-muted resize-none outline-none leading-relaxed min-h-[28px] max-h-32 py-0.5"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isPending || (!input.trim() && !photoFile)}
              className="p-1.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-text/40 backdrop-blur-sm">
          <div className="bg-bg rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text">
                Signaler {reportTarget.name}
              </h3>
              <button onClick={() => setReportTarget(null)} className="text-text-muted hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            {reportSent ? (
              <p className="text-success text-sm font-medium text-center py-4">
                ✓ Signalement envoyé — merci.
              </p>
            ) : (
              <>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Décris le problème (comportement offensant, spam…)"
                  rows={4}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-muted resize-none outline-none focus:border-primary/40 transition-colors mb-4"
                />
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                  className="w-full bg-warning text-white font-semibold py-2.5 rounded-xl hover:bg-warning/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Envoyer le signalement
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
