export default function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 24,
      boxShadow: 'var(--shadow-card)',
      ...style,
    }}>
      {children}
    </div>
  )
}
