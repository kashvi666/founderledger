import { dateRangePresets } from '../lib/format'

const inputStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  padding: '8px 12px',
  fontSize: 13,
  width: '100%',
}

export default function FilterBar({ filters, onChange, categories = [] }) {
  const presets = dateRangePresets()

  const set = (key, val) => onChange({ ...filters, [key]: val })

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map(p => {
          const active = filters.date_from === p.date_from && filters.date_to === p.date_to
          return (
            <button key={p.label} onClick={() => onChange({ ...filters, date_from: p.date_from, date_to: p.date_to })}
              style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Custom date range */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="date" value={filters.date_from || ''} onChange={e => set('date_from', e.target.value)} style={{ ...inputStyle, width: 140 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
        <input type="date" value={filters.date_to || ''} onChange={e => set('date_to', e.target.value)} style={{ ...inputStyle, width: 140 }} />
      </div>

      {/* Type filter */}
      <select value={filters.type || ''} onChange={e => set('type', e.target.value)} style={{ ...inputStyle, width: 130 }}>
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      {/* Category filter */}
      <select value={filters.category_id || ''} onChange={e => set('category_id', e.target.value)} style={{ ...inputStyle, width: 180 }}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  )
}
