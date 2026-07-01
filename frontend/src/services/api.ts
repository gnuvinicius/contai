const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

const accessTokenKey = 'contai.access_token'
const refreshTokenKey = 'contai.refresh_token'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type ApiRequestOptions = RequestInit & {
  auth?: boolean
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function getToken(key: string) {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(key)
}

function setToken(key: string, value: string | null) {
  if (typeof window === 'undefined') return
  if (value === null) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, value)
}

export function getStoredAccessToken() {
  return getToken(accessTokenKey)
}

export function getStoredRefreshToken() {
  return getToken(refreshTokenKey)
}

export function setStoredTokens(tokens: { access?: string | null; refresh?: string | null }) {
  if ('access' in tokens) setToken(accessTokenKey, tokens.access ?? null)
  if ('refresh' in tokens) setToken(refreshTokenKey, tokens.refresh ?? null)
}

export function clearStoredTokens() {
  setStoredTokens({ access: null, refresh: null })
}

function safeParseBody(body: string) {
  if (!body) return null

  try {
    return JSON.parse(body)
  } catch {
    return body
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers)
  const auth = options.auth ?? true

  if (auth) {
    const accessToken = getStoredAccessToken()
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  const hasBody = options.body !== undefined && options.body !== null
  if (hasBody && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  })

  const rawText = await response.text()
  const body = safeParseBody(rawText)

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string'
        ? body.detail
        : response.statusText) || 'Request failed'
    throw new ApiError(message, response.status, body)
  }

  if (response.status === 204 || !rawText) {
    return undefined as T
  }

  return body as T
}
