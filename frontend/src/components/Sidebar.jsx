import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tags, Bot } from 'lucide-react'

const links = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/categories',   icon: Tags,            label: 'Categories' },
  { to: '/ai',           icon: Bot,             label: 'AI Analyst' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '28px 0', position: 'fixed',
      top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: 'var(--accent)' }}>
          Founder<span style={{ color: 'var(--text-primary)' }}>Ledger</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>startup finance os</div>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.15s ease',
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 24px 0', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v1.0.0 · FounderLedger</div>
      </div>
    </aside>
  )
}
