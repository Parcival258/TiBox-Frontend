import { io, type Socket } from 'socket.io-client'
import { postJson, resolveServiceUrl } from '@/shared/services/api'

const realtimeUrl = resolveServiceUrl(
  import.meta.env.VITE_WS_URL ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:3333'
)

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
