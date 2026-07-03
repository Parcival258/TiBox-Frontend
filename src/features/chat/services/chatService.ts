import { deleteJson, getJson, postJson } from '@/shared/services/api'
import type { ChatConversation, ChatMessagesResponse, ChatUser } from '../types'

type ConversationsResponse = {
  conversations: ChatConversation[]
}

type ConversationResponse = {
  conversation: ChatConversation
}

type UsersResponse = {
  users: ChatUser[]
}

type MessageResponse = {
  conversation: ChatConversation
  message: ChatMessagesResponse['messages'][number]
}

type ReadResponse = {
  conversationId: string
  readAt: string | null
  unreadCount: number
  userId: string
}

export function listChatUsers() {
  return getJson<UsersResponse>('/api/v1/chat/users')
}

export function listChatConversations() {
  return getJson<ConversationsResponse>('/api/v1/chat/conversations')
}

export function createDirectConversation(userId: string) {
  return postJson<ConversationResponse>('/api/v1/chat/conversations/direct', { userId })
}

export function createGroupConversation(name: string, memberIds: string[]) {
  return postJson<ConversationResponse>('/api/v1/chat/conversations/group', { memberIds, name })
}

export function listChatMessages(conversationId: string, page = 1, perPage = 50) {
  return getJson<ChatMessagesResponse>(
    `/api/v1/chat/conversations/${conversationId}/messages?page=${page}&perPage=${perPage}`
  )
}

export function sendChatMessage(conversationId: string, body: string) {
  return postJson<MessageResponse>(`/api/v1/chat/conversations/${conversationId}/messages`, { body })
}

export function markChatConversationRead(conversationId: string, messageId?: string) {
  return postJson<ReadResponse>(`/api/v1/chat/conversations/${conversationId}/read`, { messageId })
}

export function clearChatConversation(conversationId: string) {
  return deleteJson(`/api/v1/chat/conversations/${conversationId}/messages`)
}

export function deleteChatConversation(conversationId: string) {
  return deleteJson(`/api/v1/chat/conversations/${conversationId}`)
}
