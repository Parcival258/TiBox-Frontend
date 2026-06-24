import { useMemo, useState } from 'react'
import type { useChatState } from '../hooks/useChatState'
import type { ChatConversation, ChatMessage, ChatUser } from '../types'

type ChatController = ReturnType<typeof useChatState>

type ChatPageProps = {
  chat: ChatController
  currentUserId: string | null
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatConversationDate(value: string | null) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

function messagePreview(conversation: ChatConversation) {
  if (!conversation.lastMessage) {
    return 'Sin mensajes todavia'
  }

  return conversation.lastMessage.body
}

function deliveryLabel(status: ChatMessage['deliveryStatus']) {
  if (status === 'sending') return 'Enviando...'
  if (status === 'failed') return 'No enviado'
  if (status === 'read') return 'Leido'

  return 'Entregado'
}

function participantSummary(conversation: ChatConversation) {
  if (conversation.type === 'direct') {
    return 'Disponible'
  }

  return `${conversation.participants.length} participantes`
}

export function ChatPage({ chat, currentUserId }: ChatPageProps) {
  const [composerValue, setComposerValue] = useState('')
  const [groupName, setGroupName] = useState('')
  const [isGroupMode, setIsGroupMode] = useState(false)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredContacts = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase()
    if (!normalizedSearch) {
      return chat.contacts
    }

    return chat.contacts.filter((contact) =>
      [contact.name, contact.email, contact.department, contact.jobTitle]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch))
    )
  }, [chat.contacts, userSearch])

  function toggleMember(userId: string) {
    setSelectedMemberIds((current) =>
      current.includes(userId)
        ? current.filter((memberId) => memberId !== userId)
        : [...current, userId]
    )
  }

  function handleStartDirect(userId: string) {
    setIsSubmitting(true)
    chat.startDirectConversation(userId).finally(() => {
      setIsSubmitting(false)
      setIsNewChatOpen(false)
      setIsGroupMode(false)
      setSelectedMemberIds([])
      setUserSearch('')
    })
  }

  function handleCreateGroup() {
    if (!groupName.trim() || selectedMemberIds.length < 2) {
      return
    }

    setIsSubmitting(true)
    chat.startGroupConversation(groupName.trim(), selectedMemberIds).finally(() => {
      setIsSubmitting(false)
      setGroupName('')
      setIsNewChatOpen(false)
      setIsGroupMode(false)
      setSelectedMemberIds([])
      setUserSearch('')
    })
  }

  function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = composerValue.trim()
    if (!body) {
      return
    }

    setComposerValue('')
    chat.sendMessage(body).catch(() => setComposerValue(body))
  }

  return (
    <section className="h-[calc(100vh-11.5rem)] min-h-[38rem] overflow-hidden rounded-md border border-white/10 bg-[#111b21] shadow-2xl shadow-black/20">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-[#2a3942] bg-[#111b21] lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center justify-between gap-3 bg-[#202c33] px-4">
            <div>
              <h1 className="text-lg font-semibold text-[#e9edef]">Chats</h1>
              <p className="text-xs text-[#8696a0]">{chat.unreadCount} mensajes sin leer</p>
            </div>
            <button
              className="rounded-full bg-[#00a884] px-4 py-2 text-sm font-semibold text-[#07130f] transition hover:bg-[#06cf9c]"
              type="button"
              onClick={() => setIsNewChatOpen((current) => !current)}
            >
              Nuevo chat
            </button>
          </div>

          {isNewChatOpen && (
            <div className="border-b border-[#2a3942] bg-[#111b21] p-3">
              <div className="mb-3 grid grid-cols-2 rounded-lg bg-[#202c33] p-1">
                <button
                  className={[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    !isGroupMode ? 'bg-[#00a884] text-[#07130f]' : 'text-[#aebac1] hover:bg-[#2a3942]',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsGroupMode(false)
                    setSelectedMemberIds([])
                  }}
                >
                  Directo
                </button>
                <button
                  className={[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    isGroupMode ? 'bg-[#00a884] text-[#07130f]' : 'text-[#aebac1] hover:bg-[#2a3942]',
                  ].join(' ')}
                  type="button"
                  onClick={() => setIsGroupMode(true)}
                >
                  Grupo
                </button>
              </div>

              <div className="rounded-lg bg-[#202c33] px-3 py-2">
                <input
                  className="w-full bg-transparent text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                  placeholder="Buscar usuario"
                  type="search"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                />
              </div>

              {isGroupMode && (
                <div className="mt-3 space-y-2">
                  <input
                    className="w-full rounded-md border border-[#2a3942] bg-[#0b141a] px-3 py-2 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0] focus:border-[#00a884]"
                    placeholder="Nombre del grupo"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                  />
                  <button
                    className="w-full rounded-md bg-[#00a884] px-3 py-2 text-sm font-semibold text-[#07130f] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!groupName.trim() || selectedMemberIds.length < 2 || isSubmitting}
                    type="button"
                    onClick={handleCreateGroup}
                  >
                    Crear grupo con {selectedMemberIds.length} usuarios
                  </button>
                </div>
              )}

              <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-[#2a3942] bg-[#0b141a] p-1">
                {filteredContacts.map((contact) => (
                  <ContactRow
                    contact={contact}
                    isGroupMode={isGroupMode}
                    isSelected={selectedMemberIds.includes(contact.id)}
                    key={contact.id}
                    onDirect={() => handleStartDirect(contact.id)}
                    onToggle={() => toggleMember(contact.id)}
                  />
                ))}
                {!filteredContacts.length && (
                  <p className="px-3 py-6 text-center text-sm text-[#8696a0]">No hay usuarios activos.</p>
                )}
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {chat.status === 'loading' && (
              <p className="px-3 py-6 text-center text-sm text-[#8696a0]">Cargando conversaciones...</p>
            )}
            {chat.conversations.map((conversation) => (
              <ConversationRow
                conversation={conversation}
                isActive={conversation.id === chat.activeConversationId}
                key={conversation.id}
                onOpen={() => chat.openConversation(conversation.id)}
              />
            ))}
            {chat.status === 'ready' && !chat.conversations.length && (
              <p className="px-6 py-8 text-center text-sm text-[#8696a0]">
                Todavia no tienes conversaciones. Usa Nuevo chat para iniciar una.
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col bg-[#0b141a]">
          {chat.activeConversation ? (
            <>
              <header className="flex h-16 items-center gap-3 border-b border-[#2a3942] bg-[#202c33] px-5">
                <Avatar label={chat.activeConversation.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-[#e9edef]">
                    {chat.activeConversation.displayName}
                  </p>
                  <p className="truncate text-xs text-[#8696a0]">
                    {participantSummary(chat.activeConversation)}
                  </p>
                </div>
              </header>

              <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-6">
                <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#e9edef_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="relative mx-auto max-w-4xl space-y-2">
                  {chat.messagesStatus === 'loading' && (
                    <p className="text-center text-sm text-[#8696a0]">Cargando mensajes...</p>
                  )}
                  {chat.activeMessages.map((message) => (
                    <MessageBubble
                      currentUserId={currentUserId}
                      key={message.id}
                      message={message}
                    />
                  ))}
                </div>
              </div>

              <form className="border-t border-[#2a3942] bg-[#202c33] px-4 py-3" onSubmit={handleSendMessage}>
                <div className="mx-auto flex max-w-4xl items-center gap-3">
                  <input
                    className="min-w-0 flex-1 rounded-lg bg-[#2a3942] px-4 py-3 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0] focus:ring-1 focus:ring-[#00a884]"
                    placeholder="Escribe un mensaje"
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                  />
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-[#07130f] transition hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!composerValue.trim()}
                    title="Enviar"
                    type="submit"
                  >
                    <span className="sr-only">Enviar</span>
                    <span aria-hidden="true" className="text-lg font-bold">
                      &gt;
                    </span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#202c33] text-4xl text-[#00a884]">
                  ...
                </div>
                <p className="text-xl font-light text-[#e9edef]">Tibox Chat</p>
                <p className="mt-3 text-sm leading-6 text-[#8696a0]">
                  Selecciona una conversacion o inicia un chat con un usuario activo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ConversationRow({
  conversation,
  isActive,
  onOpen,
}: {
  conversation: ChatConversation
  isActive: boolean
  onOpen: () => void
}) {
  return (
    <button
      className={[
        'grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-[#222e35] px-3 py-3 text-left transition',
        isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]',
      ].join(' ')}
      type="button"
      onClick={onOpen}
    >
      <Avatar label={conversation.displayName} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#e9edef]">
          {conversation.displayName}
        </span>
        <span className="block truncate text-sm text-[#8696a0]">{messagePreview(conversation)}</span>
      </span>
      <span className="flex flex-col items-end gap-2">
        <span className="text-xs text-[#8696a0]">
          {formatConversationDate(conversation.lastMessageAt ?? conversation.createdAt)}
        </span>
        {conversation.unreadCount > 0 && (
          <span className="min-w-5 rounded-full bg-[#00a884] px-1.5 py-0.5 text-center text-xs font-bold text-[#07130f]">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </span>
        )}
      </span>
    </button>
  )
}

function ContactRow({
  contact,
  isGroupMode,
  isSelected,
  onDirect,
  onToggle,
}: {
  contact: ChatUser
  isGroupMode: boolean
  isSelected: boolean
  onDirect: () => void
  onToggle: () => void
}) {
  return (
    <button
      className="mb-1 grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[#202c33]"
      type="button"
      onClick={isGroupMode ? onToggle : onDirect}
    >
      <Avatar label={contact.name} small />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[#e9edef]">{contact.name}</span>
        <span className="block truncate text-xs text-[#8696a0]">{contact.jobTitle ?? contact.email}</span>
      </span>
      {isGroupMode && (
        <span
          className={[
            'h-5 w-5 rounded-full border',
            isSelected ? 'border-[#00a884] bg-[#00a884]' : 'border-[#8696a0]',
          ].join(' ')}
          aria-hidden="true"
        />
      )}
    </button>
  )
}

function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string | null
  message: ChatMessage
}) {
  const isOwn = message.senderId === currentUserId

  return (
    <div className={isOwn ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={[
          'max-w-[min(36rem,82%)] rounded-lg px-3 py-2 shadow-sm',
          isOwn ? 'rounded-tr-sm bg-[#005c4b] text-[#e9edef]' : 'rounded-tl-sm bg-[#202c33] text-[#e9edef]',
        ].join(' ')}
      >
        {!isOwn && (
          <p className="mb-1 text-xs font-semibold text-[#7de2c4]">{message.sender?.name ?? 'Usuario'}</p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.body}</p>
        <p className="mt-1 text-right text-[11px] leading-none text-[#aebac1]">
          {formatMessageTime(message.createdAt)}
          {isOwn ? ` - ${deliveryLabel(message.deliveryStatus)}` : ''}
        </p>
      </div>
    </div>
  )
}

function Avatar({ label, small = false }: { label: string; small?: boolean }) {
  const initials = label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .padEnd(2, label.charAt(0).toUpperCase())

  return (
    <span
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-[#6b7c85] font-bold text-[#111b21]',
        small ? 'h-10 w-10 text-xs' : 'h-11 w-11 text-sm',
      ].join(' ')}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
