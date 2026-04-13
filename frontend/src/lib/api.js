const BASE = '/api/v1'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Transactions ──────────────────────────────────────────────────────────────
export const api = {
  transactions: {
    list: (params = {}) => {
      const q = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
      )
      return request(`/transactions?${q}`)
    },
    create: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id)  => request(`/transactions/${id}`, { method: 'DELETE' }),
  },

  categories: {
    list: () => request('/categories'),
    create: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  },

  dashboard: {
    summary: (params = {}) => {
      const q = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
      )
      return request(`/dashboard?${q}`)
    },
  },
}
