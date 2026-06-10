import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient, createServerSupabase } from '@/lib/supabase'
import { ChatWindow } from './chat-window'

export const dynamic = 'force-dynamic'

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  photo_url: string | null
  deleted_at: string | null
  created_at: string
}

export type MessageWithSender = MessageRow & {
  sender_name: string
  is_organizer_message: boolean
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function ChatPage({ params }: { params: Promise<{ experienceId: string }> }) {
  const { experienceId } = await params

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect(`/connexion?redirect=/chat/${experienceId}`)

  const supabase = createServerSupabase()

  // Load experience
  const { data: expData } = await supabase
    .from('experiences')
    .select('id, title, date, venue_name, organizer_id')
    .eq('id', experienceId)
    .single()

  if (!expData) notFound()

  // Check organizer
  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name, user_id')
    .eq('id', expData.organizer_id)
    .single()

  const isOrganizer = organizer?.user_id === user.id

  // Check paid participant
  if (!isOrganizer) {
    const { data: reg } = await supabase
      .from('registrations')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('participant_email', user.email!)
      .eq('payment_status', 'paid')
      .single()

    if (!reg) {
      redirect(`/experiences/${experienceId}?error=chat_access`)
    }
  }

  // Get or create conversation
  let { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('experience_id', experienceId)
    .single()

  if (!conv) {
    const { data: created } = await supabase
      .from('conversations')
      .insert({ experience_id: experienceId })
      .select('id')
      .single()
    conv = created
  }

  if (!conv) notFound()

  // Load last 50 messages
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, photo_url, deleted_at, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
    .limit(50)

  const messages: MessageRow[] = rawMessages ?? []

  // Load sender profiles
  const senderIdSet = new Set(messages.map(m => m.sender_id))
  const senderIds = Array.from(senderIdSet)
  const { data: profileRows } = senderIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', senderIds)
    : { data: [] }

  const profileMap: Record<string, string> = {}
  for (const p of profileRows ?? []) {
    profileMap[p.id] = p.display_name ?? 'Participant'
  }

  const organizerUserId = organizer?.user_id ?? ''
  const organizerName = organizer?.display_name ?? 'Organisateur'

  const messagesWithSender: MessageWithSender[] = messages.map(m => ({
    ...m,
    sender_name: profileMap[m.sender_id] ?? 'Participant',
    is_organizer_message: m.sender_id === organizerUserId,
  }))

  // Unread count
  const { data: readRow } = await supabase
    .from('message_reads')
    .select('last_read_at')
    .eq('user_id', user.id)
    .eq('conversation_id', conv.id)
    .single()

  const lastReadAt = readRow?.last_read_at ?? null

  // Afterglow check: disable sending 30 days after the event
  const isAfterglowExpired = new Date(expData.date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const currentUserName = currentProfile?.display_name ?? user.email ?? 'Vous'

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={isOrganizer ? `/organisateur/soirees/${experienceId}` : '/compte'}
            className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-text text-sm leading-tight truncate">
              {expData.title}
            </p>
            <p className="text-text-muted text-xs capitalize truncate">
              {formatDate(expData.date)} · {expData.venue_name}
            </p>
          </div>
        </div>
      </div>

      <ChatWindow
        conversationId={conv.id}
        experienceId={experienceId}
        initialMessages={messagesWithSender}
        currentUserId={user.id}
        currentUserName={currentUserName}
        isOrganizer={isOrganizer}
        organizerUserId={organizerUserId}
        organizerName={organizerName}
        lastReadAt={lastReadAt}
        isAfterglowExpired={isAfterglowExpired}
      />
    </main>
  )
}
