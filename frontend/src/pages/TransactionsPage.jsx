import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import FilterBar from '../components/FilterBar'
import AddTransactionModal from '../components/AddTransactionModal'
import Card from '../components/Card'

export default function TransactionsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ date_from: '', date_to: '', type: '', category_id: '' })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [res, cats] = await Promise.all([api.transactions.list(filters), api.categories.list()])
      setItems(res.items); setTotal(res.total); setCategories(cats)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    setDeleting(id)
    try { await api.transactions.delete(id); load() }
    catch (e) { alert(e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{total} total entries</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: 'var(--accent)', color: '#000', borderRadius: 'var(--radius-sm)',
          fontWeight: 700, fontSize: 14,
        }}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} categories={categories} />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px 80px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>Note / Category</span><span>Date</span><span>Amount</span><span>Type</span><span></span>
        </div>

        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="skeleton" style={{ height: 20, width: '60%' }} />
              </div>
            ))
          : items.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No transactions found</div>
            : items.map((txn, i) => (
                <div key={txn.id} className="fade-up" style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px 80px',
                  padding: '14px 20px', borderBottom: '1px solid var(--border-light)',
                  alignItems: 'center', animationDelay: `${i * 0.03}s`,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{txn.note || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{txn.category.name}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{formatDate(txn.date)}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, color: txn.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                    color: txn.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {txn.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {txn.type}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleDelete(txn.id)} disabled={deleting === txn.id}
                      style={{ background: 'none', color: 'var(--text-muted)', padding: 6, borderRadius: 6, display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
        }
      </Card>

      {showModal && <AddTransactionModal categories={categories} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); load() }} />}
    </div>
  )
}
