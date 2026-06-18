import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatters'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'

export const CustomerAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getCustomerAnalytics().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <StatsSkeleton />

  const topCustomers = data?.topCustomers || []
  const customers = Array.isArray(topCustomers) ? topCustomers.map(row => {
    if (Array.isArray(row)) {
      return { id: row[0], name: row[1], email: row[2], orderCount: row[3], totalSpent: row[4] }
    }
    return row
  }) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={28} style={{ color: 'var(--sp-sienna)' }} /> Customer Analytics
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <div className="card"><div className="card-body">
          <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Total Customers</small>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0' }}>{customers.length}</p>
        </div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {customers.map((c, i) => (
          <div key={c.id || i} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sp-sienna-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} style={{ color: 'var(--sp-sienna)' }} />
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem' }}>{c.name}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--sp-text-muted)' }}>{c.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--sp-text-muted)' }}>Orders</span>
              <span style={{ fontWeight: 600 }}>{c.orderCount ?? '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--sp-text-muted)' }}>Total Spent</span>
              <span style={{ fontWeight: 600, color: 'var(--sp-sage)' }}>{formatCurrency(c.totalSpent ?? 0)}</span>
            </div>
          </div>
        ))}
        {customers.length === 0 && <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--sp-text-muted)' }}>No customer data available</div>}
      </div>
    </div>
  )
}
