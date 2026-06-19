const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/$/, '')
let csrfToken: string | null = null

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
    throw new Error(`HTTP ${response.status}`)
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
    throw new Error(`HTTP ${response.status}`)
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
    throw new Error(`HTTP ${response.status}`)
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
    throw new Error(`HTTP ${response.status}`)
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
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

export { buildUrl, deleteJson, getJson, patchJson, postForm, postJson, refreshCsrfToken }
