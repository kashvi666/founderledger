import { useState, useEffect } from 'react'
import { Plus, Tag } from 'lucide-react'
import { api } from '../lib/api'
import Card from '../components/Card'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: 14,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', type: 'expense' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try { setCategories(await api.categories.list()) }
    catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true); setError('')
    try { await api.categories.create(form); setForm({ name: '', type: 'expense' }); load() }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const income = categories.filter(c => c.type === 'income')
  const expense = categories.filter(c => c.type === 'expense')

  const Group = ({ title, items, color }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(c => (
          <div key={c.id} className="fade-up" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag size={14} color={color} />
              <span style={{ fontSize: 14 }}>{c.name}</span>
            </div>
            {c.is_default && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 99 }}>default</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Categories</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Manage transaction categories</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Category lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <Group title="Expense Categories" items={expense} color="var(--red)" />
          <Group title="Income Categories" items={income} color="var(--green)" />
        </div>

        {/* Add form */}
        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Add Custom Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Category name" style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              {['expense', 'income'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                  flex: 1, padding: '9px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
                  background: form.type === t ? (t === 'income' ? 'rgba(45,212,160,0.15)' : 'rgba(240,93,93,0.15)') : 'var(--bg-elevated)',
                  color: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--text-secondary)',
                  border: `1px solid ${form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
                  textTransform: 'capitalize', cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
            <button onClick={submit} disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 14,
              background: 'var(--accent)', color: '#000', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}>
              <Plus size={16} />{loading ? 'Adding…' : 'Add Category'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
