import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Flame } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { api } from '../lib/api'
import { formatCurrency, dateRangePresets } from '../lib/format'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import FilterBar from '../components/FilterBar'

const COLORS = ['#f5a623','#2dd4a0','#5d9cf0','#f05d5d','#c084fc','#fb923c','#34d399']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ date_from: '', date_to: '', granularity: 'monthly' })
  const [loading, setLoading] = useState(true)

  const presets = dateRangePresets()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summary, cats] = await Promise.all([
        api.dashboard.summary(filters),
        api.categories.list(),
      ])
      setData(summary)
      setCategories(cats)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  if (loading && !data) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
    </div>
  )

  const pieData = data?.category_breakdown?.map(c => ({ name: c.category, value: parseFloat(c.total) })) || []
  const tsData = data?.time_series?.map(t => ({
    period: t.period, Income: parseFloat(t.income), Expenses: parseFloat(t.expenses),
  })) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Your startup's financial pulse</p>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} categories={categories} />

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Income" value={formatCurrency(data?.total_income)} accent="green" icon={TrendingUp} />
        <StatCard label="Total Expenses" value={formatCurrency(data?.total_expenses)} accent="red" icon={TrendingDown} />
        <StatCard label="Net Balance" value={formatCurrency(data?.net_balance)}
          accent={parseFloat(data?.net_balance) >= 0 ? 'green' : 'red'} icon={DollarSign} />
        <StatCard
          label="Monthly Burn"
          value={formatCurrency(data?.burn_rate?.monthly_burn)}
          sub={data?.burn_rate?.runway_months != null ? `~${data.burn_rate.runway_months} months runway` : 'No burn data'}
          accent="default"
          icon={Flame}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Income vs Expenses over time */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Income vs Expenses</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['monthly','weekly'].map(g => (
                <button key={g} onClick={() => setFilters(f => ({ ...f, granularity: g }))}
                  style={{
                    padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: filters.granularity === g ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: filters.granularity === g ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1px solid ${filters.granularity === g ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}>{g}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tsData} barCategoryGap="30%">
              <XAxis dataKey="period" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              <Bar dataKey="Income" fill="var(--green)" radius={[4,4,0,0]} />
              <Bar dataKey="Expenses" fill="var(--red)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category breakdown pie */}
        <Card>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Spend by Category</h3>
          {pieData.length === 0
            ? <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No expense data</div>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={48} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
          }
        </Card>
      </div>
    </div>
  )
}
