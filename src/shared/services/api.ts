const localApiUrl = 'http://localhost:3333'

function isLocalServiceUrl(value: string) {
  try {
    const url = new URL(value)
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  } catch {
    return false
  }
}

function devTunnelServiceUrl(currentHref: string, targetPort: number) {
  try {
    const currentUrl = new URL(currentHref)
    const match = currentUrl.hostname.match(/^(.+)-\d+\.use2\.devtunnels\.ms$/i)

    if (!match) {
      return null
    }

    return `${currentUrl.protocol}//${match[1]}-${targetPort}.use2.devtunnels.ms`
  } catch {
    return null
  }
}

function resolveServiceUrl(
  configuredUrl = localApiUrl,
  currentHref = typeof window === 'undefined' ? '' : window.location.href,
  targetPort = 3333
) {
  const normalizedUrl = configuredUrl.replace(/\/$/, '')

  if (!isLocalServiceUrl(normalizedUrl)) {
    return normalizedUrl
  }

  return devTunnelServiceUrl(currentHref, targetPort) ?? normalizedUrl
}

const apiUrl = resolveServiceUrl(import.meta.env.VITE_API_URL ?? localApiUrl)
let csrfToken: string | null = null

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(
    status: number,
    message: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function buildUrl(path: string) {
  return `${apiUrl}/${path.replace(/^\//, '')}`
}

function getXsrfToken() {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('XSRF-TOKEN='))

  return cookie?.slice('XSRF-TOKEN='.length) ?? null
}

function csrfHeaders(): Record<string, string> {
  if (csrfToken) {
    return { 'X-CSRF-TOKEN': csrfToken }
  }

  const xsrfToken = getXsrfToken()

  return xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}
}

function jsonHeaders() {

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...csrfHeaders(),
  }
}

function mutationHeaders() {
  return {
    Accept: 'application/json',
    ...csrfHeaders(),
  }
}

async function refreshCsrfToken() {
  const response = await fetch(buildUrl('/api/v1/auth/csrf'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const body = await response.json() as { csrfToken: string }
  csrfToken = body.csrfToken
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw await apiError(response)
  }

  return response.json()
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw await apiError(response)
  }

  return response.json()
}

async function patchJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw await apiError(response)
  }

  return response.json()
}

async function deleteJson(path: string): Promise<void> {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    credentials: 'include',
    headers: mutationHeaders(),
  })

  if (!response.ok) {
    throw await apiError(response)
  }
}

async function postForm<T>(path: string, body: FormData): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: mutationHeaders(),
    body,
  })

  if (!response.ok) {
    throw await apiError(response)
  }

  return response.json()
}

async function apiError(response: Response) {
  let details: unknown
  let message = `HTTP ${response.status}`

  try {
    details = await response.json()

    if (
      details &&
      typeof details === 'object' &&
      'message' in details &&
      typeof details.message === 'string'
    ) {
      message = details.message
    }
  } catch {
    message = response.statusText || message
  }

  return new ApiError(response.status, message, details)
}

export { buildUrl, deleteJson, getJson, patchJson, postForm, postJson, refreshCsrfToken, resolveServiceUrl }
