import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRealtimeSocket, getRealtimeToken } from '@/shared/services/realtime'
import {
  createDirectConversation,
  createGroupConversation,
  clearChatConversation,
  deleteChatConversation,
  listChatConversations,
  listChatMessages,
  listChatUsers,
  markChatConversationRead,
  sendChatMessage,
} from '../services/chatService'
import type { ChatConversation, ChatMessage, ChatStateStatus, ChatUser } from '../types'

type ChatNotification = {
  action?: {
    conversationId?: string
    type: 'chat'
  }
  subText?: string
  title: string
  type: 'alert' | 'ticket' | 'system'
}

type UseChatStateOptions = {
  authStatus: string
  isChatViewActive: boolean
  onNotify: (notification: ChatNotification) => void
  userId: string | null
}

type ChatMessageCreatedPayload = {
  conversation: ChatConversation
  message: ChatMessage
}

type ChatMessagesReadPayload = {
  conversationId: string
  readAt: string | null
  unreadCount: number
  userId: string
}

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((a, b) => {
    const left = a.lastMessageAt ?? a.updatedAt
    const right = b.lastMessageAt ?? b.updatedAt

    return right.localeCompare(left)
  })
}

function upsertConversation(
  conversations: ChatConversation[],
  conversation: ChatConversation
) {
  const exists = conversations.some((item) => item.id === conversation.id)
  const next = exists
    ? conversations.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
    : [conversation, ...conversations]

  return sortConversations(next)
}

function upsertMessage(messages: ChatMessage[], message: ChatMessage) {
  const exists = messages.some((item) => item.id === message.id)

  return exists ? messages.map((item) => (item.id === message.id ? message : item)) : [...messages, message]
}

function replaceMessage(messages: ChatMessage[], temporaryId: string, message: ChatMessage) {
  const withoutTemporary = messages.filter((item) => item.id !== temporaryId)
  const exists = withoutTemporary.some((item) => item.id === message.id)

  return exists
    ? withoutTemporary.map((item) => (item.id === message.id ? message : item))
    : [...withoutTemporary, message]
}

export function useChatState({ authStatus, isChatViewActive, onNotify, userId }: UseChatStateOptions) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [contacts, setContacts] = useState<ChatUser[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({})
  const [status, setStatus] = useState<ChatStateStatus>('idle')
  const [messagesStatus, setMessagesStatus] = useState<ChatStateStatus>('idle')
  const activeConversationIdRef = useRef<string | null>(null)
  const isChatViewActiveRef = useRef(isChatViewActive)
  const onNotifyRef = useRef(onNotify)

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    isChatViewActiveRef.current = isChatViewActive
  }, [isChatViewActive])

  useEffect(() => {
    onNotifyRef.current = onNotify
  }, [onNotify])

  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
    [conversations]
  )

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  )

  const activeMessages = activeConversationId
    ? messagesByConversation[activeConversationId] ?? []
    : []

  const refreshConversations = useCallback(() => {
    if (authStatus !== 'authenticated' || !userId) {
      return Promise.resolve()
    }

    setStatus((current) => (current === 'ready' ? current : 'loading'))

    return listChatConversations()
      .then(({ conversations: nextConversations }) => {
        setConversations(sortConversations(nextConversations))
        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [authStatus, userId])

  const refreshContacts = useCallback(() => {
    if (authStatus !== 'authenticated' || !userId) {
      return Promise.resolve()
    }

    return listChatUsers()
      .then(({ users }) => setContacts(users))
      .catch(() => undefined)
  }, [authStatus, userId])

  const loadMessages = useCallback((conversationId: string, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setMessagesStatus('loading')
    }

    return listChatMessages(conversationId)
      .then(({ messages }) => {
        setMessagesByConversation((current) => ({ ...current, [conversationId]: messages }))
        setMessagesStatus('ready')

        const lastMessage = messages[messages.length - 1]
        return markChatConversationRead(conversationId, lastMessage?.id)
      })
      .then((readResult) => {
        if (!readResult) {
          return
        }

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, unreadCount: readResult.unreadCount }
              : conversation
          )
        )
      })
      .catch(() => {
        setMessagesStatus('error')
      })
  }, [])

  const openConversation = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId)
      return loadMessages(conversationId)
    },
    [loadMessages]
  )

  const startDirectConversation = useCallback(
    (targetUserId: string) =>
      createDirectConversation(targetUserId).then(({ conversation }) => {
        setConversations((current) => upsertConversation(current, conversation))
        setActiveConversationId(conversation.id)
        return loadMessages(conversation.id)
      }),
    [loadMessages]
  )

  const startGroupConversation = useCallback(
    (name: string, memberIds: string[]) =>
      createGroupConversation(name, memberIds).then(({ conversation }) => {
        setConversations((current) => upsertConversation(current, conversation))
        setActiveConversationId(conversation.id)
        return loadMessages(conversation.id)
      }),
    [loadMessages]
  )

  const markConversationRead = useCallback((conversationId: string) => {
    const lastMessage = messagesByConversation[conversationId]?.at(-1)

    return markChatConversationRead(conversationId, lastMessage?.id)
      .then((readResult) => {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, unreadCount: readResult.unreadCount }
              : conversation
          )
        )
      })
      .catch(() => undefined)
  }, [messagesByConversation])

  const clearConversation = useCallback((conversationId: string) => {
    return clearChatConversation(conversationId).then(() => {
      setMessagesByConversation((current) => ({ ...current, [conversationId]: [] }))
      return refreshConversations()
    })
  }, [refreshConversations])

  const deleteConversation = useCallback((conversationId: string) => {
    return deleteChatConversation(conversationId).then(() => {
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId)
      )
      setMessagesByConversation((current) => {
        const next = { ...current }
        delete next[conversationId]
        return next
      })
      setActiveConversationId((current) => (current === conversationId ? null : current))
    })
  }, [])

  const sendMessage = useCallback(
    (body: string) => {
      if (!activeConversationId) {
        return Promise.resolve()
      }

      const temporaryId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const createdAt = new Date().toISOString()
      const pendingMessage: ChatMessage = {
        id: temporaryId,
        body,
        conversationId: activeConversationId,
        createdAt,
        deliveryStatus: 'sending',
        reads: [],
        sender: null,
        senderId: userId,
        updatedAt: createdAt,
      }

      setMessagesByConversation((current) => ({
        ...current,
        [activeConversationId]: [...(current[activeConversationId] ?? []), pendingMessage],
      }))

      return sendChatMessage(activeConversationId, body)
        .then(({ conversation, message }) => {
          setConversations((current) => upsertConversation(current, { ...conversation, unreadCount: 0 }))
          setMessagesByConversation((current) => ({
            ...current,
            [activeConversationId]: replaceMessage(
              current[activeConversationId] ?? [],
              temporaryId,
              message
            ),
          }))
        })
        .catch((error) => {
          setMessagesByConversation((current) => ({
            ...current,
            [activeConversationId]: (current[activeConversationId] ?? []).map((message) =>
              message.id === temporaryId ? { ...message, deliveryStatus: 'failed' } : message
            ),
          }))
          throw error
        })
    },
    [activeConversationId, userId]
  )

  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) {
      setActiveConversationId(null)
      setContacts([])
      setConversations([])
      setMessagesByConversation({})
      setStatus('idle')
      return
    }

    refreshConversations()
    refreshContacts()
  }, [authStatus, refreshContacts, refreshConversations, userId])

  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) {
      return
    }

    let isActive = true
    let socket: ReturnType<typeof createRealtimeSocket> | null = null

    getRealtimeToken()
      .then(({ token }) => {
        if (!isActive) {
          return
        }

        socket = createRealtimeSocket(token)

        socket.on('chat:conversation_updated', () => {
          refreshConversations()
        })

        socket.on('chat:message_created', (payload: ChatMessageCreatedPayload) => {
          const activeId = activeConversationIdRef.current
          const canReadActiveConversation = isChatViewActiveRef.current && activeId === payload.message.conversationId
          setConversations((current) => upsertConversation(current, payload.conversation))

          if (payload.message.senderId !== userId && !canReadActiveConversation) {
            onNotifyRef.current({
              action: {
                conversationId: payload.message.conversationId,
                type: 'chat',
              },
              subText: payload.message.body,
              title: payload.conversation.displayName,
              type: 'system',
            })
          }

          if (canReadActiveConversation) {
            setMessagesByConversation((current) => ({
              ...current,
              [payload.message.conversationId]: upsertMessage(
                current[payload.message.conversationId] ?? [],
                payload.message
              ),
            }))
            markChatConversationRead(payload.message.conversationId, payload.message.id).catch(
              () => undefined
            )
          }
        })

        socket.on('chat:messages_read', (payload: ChatMessagesReadPayload) => {
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === payload.conversationId && payload.userId === userId
                ? { ...conversation, unreadCount: payload.unreadCount }
                : conversation
            )
          )
        })
      })
      .catch(() => undefined)

    return () => {
      isActive = false
      socket?.disconnect()
    }
  }, [authStatus, loadMessages, refreshConversations, userId])

  return {
    activeConversation,
    activeConversationId,
    activeMessages,
    contacts,
    conversations,
    messagesStatus,
    clearConversation,
    deleteConversation,
    markConversationRead,
    openConversation,
    refreshConversations,
    sendMessage,
    setActiveConversationId,
    startDirectConversation,
    startGroupConversation,
    status,
    unreadCount,
  }
}
