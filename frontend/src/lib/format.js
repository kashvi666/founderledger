export function formatCurrency(value) {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function dateRangePresets() {
  const today = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  const sub = (days) => { const d = new Date(today); d.setDate(d.getDate() - days); return fmt(d) }
  const subMonths = (m) => { const d = new Date(today); d.setMonth(d.getMonth() - m); return fmt(d) }

  return [
    { label: 'Last 7 days',  date_from: sub(7),         date_to: fmt(today) },
    { label: 'Last 30 days', date_from: sub(30),        date_to: fmt(today) },
    { label: 'Last 3 months',date_from: subMonths(3),   date_to: fmt(today) },
    { label: 'Last 6 months',date_from: subMonths(6),   date_to: fmt(today) },
    { label: 'All time',     date_from: '',              date_to: ''         },
  ]
}
