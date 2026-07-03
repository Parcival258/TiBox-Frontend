import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import type { ConfirmAction } from '@/app/hooks/useConfirmAction'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import type { useChatState } from '../hooks/useChatState'
import type { ChatConversation, ChatMessage, ChatUser } from '../types'
import './ChatPage.css'

type ChatController = ReturnType<typeof useChatState>

type ChatPageProps = {
  chat: ChatController
  currentUserId: string | null
  requestConfirmation: (action: ConfirmAction) => void
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

export function ChatPage({ chat, currentUserId, requestConfirmation }: ChatPageProps) {
  const [composerValue, setComposerValue] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [groupName, setGroupName] = useState('')
  const [isGroupMode, setIsGroupMode] = useState(false)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const lastMessageId = chat.activeMessages.at(-1)?.id

  useEffect(() => {
    if (!chat.activeConversationId) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      const container = messagesContainerRef.current

      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [chat.activeConversationId, chat.messagesStatus, lastMessageId])

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

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = composerValue.trim()
    if (!body) {
      return
    }

    setComposerValue('')
    chat.sendMessage(body).catch(() => setComposerValue(body))
  }

  function requestClearConversation(conversation: ChatConversation) {
    requestConfirmation({
      confirmLabel: 'Vaciar chat',
      message: `Se borraran todos los mensajes de ${conversation.displayName}, pero la conversacion seguira disponible.`,
      onConfirm: () => {
        void chat.clearConversation(conversation.id)
      },
      title: 'Vaciar conversacion',
    })
  }

  function requestDeleteConversation(conversation: ChatConversation) {
    requestConfirmation({
      confirmLabel: 'Borrar chat',
      message: `Se eliminara la conversacion ${conversation.displayName} y sus mensajes para todos los participantes.`,
      onConfirm: () => {
        void chat.deleteConversation(conversation.id)
      },
      title: 'Borrar conversacion',
    })
  }

  function openConversationMenu(
    conversation: ChatConversation,
    event: MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault()

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: [
        {
          icon: 'eye',
          label: 'Abrir chat',
          onSelect: () => chat.openConversation(conversation.id),
        },
        {
          disabled: conversation.unreadCount === 0,
          icon: 'check',
          label: 'Marcar como leido',
          onSelect: () => chat.markConversationRead(conversation.id),
        },
        {
          icon: 'settings',
          label: 'Vaciar chat',
          onSelect: () => requestClearConversation(conversation),
          separatorBefore: true,
          tone: 'muted',
        },
        {
          icon: 'trash',
          label: 'Borrar chat',
          onSelect: () => requestDeleteConversation(conversation),
          separatorBefore: true,
          tone: 'danger',
        },
      ],
    })
  }

  return (
    <section className="chat-page">
      <div className="chat-page__layout">
        <aside
          className={[
            'chat-page__sidebar',
            chat.activeConversation ? 'chat-page__sidebar--hidden-mobile' : '',
          ].join(' ')}
        >
          <div className="chat-page__topbar">
            <div>
              <h1 className="chat-page__title">Chats</h1>
              <p className="chat-page__subtitle">{chat.unreadCount} mensajes sin leer</p>
            </div>
            <button
              className="chat-page__primary-button"
              type="button"
              onClick={() => setIsNewChatOpen((current) => !current)}
            >
              Nuevo chat
            </button>
          </div>

          {isNewChatOpen && (
            <div className="chat-page__new-chat">
              <div className="chat-page__segmented">
                <button
                  className={[
                    'chat-page__segment',
                    !isGroupMode ? 'chat-page__segment--active' : '',
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
                    'chat-page__segment',
                    isGroupMode ? 'chat-page__segment--active' : '',
                  ].join(' ')}
                  type="button"
                  onClick={() => setIsGroupMode(true)}
                >
                  Grupo
                </button>
              </div>

              <div className="chat-page__search">
                <input
                  className="chat-page__input chat-page__input--flat"
                  placeholder="Buscar usuario"
                  type="search"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                />
              </div>

              {isGroupMode && (
                <div className="chat-page__group-form">
                  <input
                    className="chat-page__input"
                    placeholder="Nombre del grupo"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                  />
                  <button
                    className="chat-page__primary-button chat-page__primary-button--block"
                    disabled={!groupName.trim() || selectedMemberIds.length < 2 || isSubmitting}
                    type="button"
                    onClick={handleCreateGroup}
                  >
                    Crear grupo con {selectedMemberIds.length} usuarios
                  </button>
                </div>
              )}

              <div className="chat-page__contacts">
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
                  <p className="chat-page__empty">No hay usuarios activos.</p>
                )}
              </div>
            </div>
          )}

          <div className="chat-page__conversation-list">
            {chat.status === 'loading' && (
              <p className="chat-page__empty">Cargando conversaciones...</p>
            )}
            {chat.conversations.map((conversation) => (
              <ConversationRow
                conversation={conversation}
                isActive={conversation.id === chat.activeConversationId}
                key={conversation.id}
                onOpen={() => chat.openConversation(conversation.id)}
                onOpenContextMenu={(event) => openConversationMenu(conversation, event)}
              />
            ))}
            {chat.status === 'ready' && !chat.conversations.length && (
              <p className="chat-page__empty chat-page__empty--wide">
                Todavia no tienes conversaciones. Usa Nuevo chat para iniciar una.
              </p>
            )}
          </div>
        </aside>

        <div
          className={[
            'chat-page__thread',
            chat.activeConversation ? 'chat-page__thread--active-mobile' : '',
          ].join(' ')}
        >
          {chat.activeConversation ? (
            <>
              <header className="chat-page__thread-header">
                <button
                  className="chat-page__back-button"
                  type="button"
                  onClick={() => chat.setActiveConversationId(null)}
                >
                  <span aria-hidden="true">&lt;</span>
                  <span className="sr-only">Volver a chats</span>
                </button>
                <Avatar label={chat.activeConversation.displayName} />
                <div className="chat-page__thread-title">
                  <p>
                    {chat.activeConversation.displayName}
                  </p>
                  <span>
                    {participantSummary(chat.activeConversation)}
                  </span>
                </div>
              </header>

              <div className="chat-page__messages" ref={messagesContainerRef}>
                <div className="chat-page__message-pattern" />
                <div className="chat-page__message-list">
                  {chat.messagesStatus === 'loading' && (
                    <p className="chat-page__empty">Cargando mensajes...</p>
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

              <form className="chat-page__composer" onSubmit={handleSendMessage}>
                <div className="chat-page__composer-inner">
                  <input
                    className="chat-page__composer-input"
                    placeholder="Escribe un mensaje"
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                  />
                  <button
                    className="chat-page__send-button"
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
            <div className="chat-page__placeholder">
              <div>
                <div className="chat-page__placeholder-icon">
                  ...
                </div>
                <p className="chat-page__placeholder-title">Tibox Chat</p>
                <p className="chat-page__placeholder-text">
                  Selecciona una conversacion o inicia un chat con un usuario activo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </section>
  )
}

function ConversationRow({
  conversation,
  isActive,
  onOpen,
  onOpenContextMenu,
}: {
  conversation: ChatConversation
  isActive: boolean
  onOpen: () => void
  onOpenContextMenu: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      className={[
        'chat-page__conversation',
        isActive ? 'chat-page__conversation--active' : '',
      ].join(' ')}
      type="button"
      onClick={onOpen}
      onContextMenu={onOpenContextMenu}
    >
      <Avatar label={conversation.displayName} />
      <span className="chat-page__conversation-copy">
        <span className="chat-page__conversation-name">
          {conversation.displayName}
        </span>
        <span className="chat-page__conversation-preview">{messagePreview(conversation)}</span>
      </span>
      <span className="chat-page__conversation-meta">
        <span>
          {formatConversationDate(conversation.lastMessageAt ?? conversation.createdAt)}
        </span>
        {conversation.unreadCount > 0 && (
          <span className="chat-page__badge">
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
      className="chat-page__contact"
      type="button"
      onClick={isGroupMode ? onToggle : onDirect}
    >
      <Avatar label={contact.name} small />
      <span className="chat-page__contact-copy">
        <span className="chat-page__contact-name">{contact.name}</span>
        <span className="chat-page__contact-subtitle">{contact.jobTitle ?? contact.email}</span>
      </span>
      {isGroupMode && (
        <span
          className={[
            'chat-page__selection-dot',
            isSelected ? 'chat-page__selection-dot--selected' : '',
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
          'chat-page__bubble',
          isOwn ? 'chat-page__bubble--own' : 'chat-page__bubble--other',
        ].join(' ')}
      >
        {!isOwn && (
          <p className="chat-page__sender">{message.sender?.name ?? 'Usuario'}</p>
        )}
        <p className="chat-page__message-body">{message.body}</p>
        <p className="chat-page__message-time">
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
        'chat-page__avatar',
        small ? 'h-10 w-10 text-xs' : 'h-11 w-11 text-sm',
      ].join(' ')}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
