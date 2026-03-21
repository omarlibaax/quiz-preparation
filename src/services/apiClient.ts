import { API_BASE_URL } from '../config/api'

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`)
  }
  return (await res.json()) as T
}

