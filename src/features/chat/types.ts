import type { User } from '@/features/users/types'

export type ChatUser = Pick<
  User,
  'department' | 'email' | 'id' | 'isActive' | 'jobTitle' | 'name' | 'role'
> & {
  initials: string
}

export type ChatParticipant = {
  id: string
  joinedAt: string
  lastReadAt: string | null
  role: 'member' | 'owner'
  user: ChatUser | null
  userId: string
}

export type ChatMessage = {
  id: string
  body: string
  conversationId: string
  createdAt: string
  deliveryStatus: 'delivered' | 'failed' | 'read' | 'sending' | 'sent'
  reads: Array<{
    deliveredAt: string | null
    readAt: string | null
    userId: string
  }>
  sender: ChatUser | null
  senderId: string | null
  updatedAt: string
}

export type ChatConversation = {
  id: string
  createdAt: string
  displayName: string
  lastMessage: ChatMessage | null
  lastMessageAt: string | null
  name: string | null
  participants: ChatParticipant[]
  type: 'direct' | 'group'
  unreadCount: number
  updatedAt: string
}

export type ChatMessagesResponse = {
  messages: ChatMessage[]
  meta: {
    currentPage: number
    firstPage: number
    firstPageUrl: string | null
    lastPage: number
    lastPageUrl: string | null
    nextPageUrl: string | null
    perPage: number
    previousPageUrl: string | null
    total: number
  }
}

export type ChatStateStatus = 'idle' | 'loading' | 'ready' | 'error'
