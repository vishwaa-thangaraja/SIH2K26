const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiGet<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  } catch {
    // Return undefined — pages will fall back to mock data
    return undefined as T
  }
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export const api = { get: apiGet, post: apiPost }
