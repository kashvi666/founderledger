import Card from './Card'

export default function StatCard({ label, value, sub, accent, icon: Icon }) {
  const color = accent === 'green' ? 'var(--green)' : accent === 'red' ? 'var(--red)' : 'var(--accent)'
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </Card>
  )
}
