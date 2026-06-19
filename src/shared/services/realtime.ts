import { io, type Socket } from 'socket.io-client'
import { postJson } from '@/shared/services/api'
//revisar esta importacion ya que no estoy seguro de que funcione asi
const apiUrl = (import.meta.env.VITE_API_URL)
const realtimeUrl = (
  import.meta.env.VITE_WS_URL ??
  import.meta.env.VITE_API_URL ??
  apiUrl
).replace(/\/$/, '')

type RealtimeTokenResponse = {
  data: {
    token: string
  }
}

export function getRealtimeToken() {
  return postJson<RealtimeTokenResponse>('/api/v1/realtime/token').then((response) => response.data)
}

export function createRealtimeSocket(token: string): Socket {
  return io(realtimeUrl, {
    auth: { token },
    path: '/realtime',
    transports: ['websocket', 'polling'],
    withCredentials: true,
  })
}
