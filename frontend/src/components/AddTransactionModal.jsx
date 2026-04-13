import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: 14,
}

export default function AddTransactionModal({ categories, onClose, onSuccess }) {
  const [form, setForm] = useState({ amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0], note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = categories.filter(c => c.type === form.type)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k === 'type' ? { category_id: '' } : {}) }))

  const submit = async () => {
    if (!form.amount || !form.category_id || !form.date) { setError('Amount, category and date are required'); return }
    setLoading(true); setError('')
    try {
      await api.transactions.create({ ...form, amount: parseFloat(form.amount), category_id: parseInt(form.category_id) })
      onSuccess()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="fade-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18 }}>Add Transaction</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['income', 'expense'].map(t => (
              <button key={t} onClick={() => set('type', t)} style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
                background: form.type === t ? (t === 'income' ? 'rgba(45,212,160,0.15)' : 'rgba(240,93,93,0.15)') : 'var(--bg-elevated)',
                color: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--text-secondary)',
                border: `1px solid ${form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
                textTransform: 'capitalize', cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>

          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => set('amount', e.target.value)} style={inputStyle} min="0" step="0.01" />

          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={inputStyle}>
            <option value="">Select category…</option>
            {filtered.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Note (optional)" value={form.note} onChange={e => set('note', e.target.value)} style={inputStyle} />

          {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}

          <button onClick={submit} disabled={loading} style={{
            padding: '12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 14,
            background: 'var(--accent)', color: '#000', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 4,
          }}>
            {loading ? 'Adding…' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}
