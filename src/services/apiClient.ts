import { API_BASE_URL } from '../config/api'

type RequestOptions = {
  accessToken?: string
}

export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: options.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
        }
      : undefined,
  })
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`)
  }
  return (await res.json()) as T
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  options: RequestOptions = {},
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken
        ? {
            Authorization: `Bearer ${options.accessToken}`,
          }
        : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `POST ${path} failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
  return (await res.json()) as TResponse
}

export async function apiPatch<TResponse, TBody>(
  path: string,
  body: TBody,
  options: RequestOptions = {},
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken
        ? {
            Authorization: `Bearer ${options.accessToken}`,
          }
        : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `PATCH ${path} failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
  return (await res.json()) as TResponse
}

