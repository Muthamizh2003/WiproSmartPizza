import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatters'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'

export const RevenueAnalytics = () => {
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getRevenue().then(setRevenue).finally(() => setLoading(false))
  }, [])

  if (loading) return <StatsSkeleton />

  const data = [
    { name: 'Total', amount: revenue?.totalRevenue || 0 },
    { name: 'Daily', amount: revenue?.dailyRevenue || 0 }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={28} style={{ color: 'var(--sp-sienna)' }} /> Revenue Analytics
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card"><div className="card-body">
          <small style={{ color: 'var(--sp-text-muted)' }}>Total Revenue</small>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--sp-sage)', margin: '0.25rem 0 0' }}>{formatCurrency(revenue?.totalRevenue || 0)}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <small style={{ color: 'var(--sp-text-muted)' }}>Daily Revenue</small>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--sp-sienna)', margin: '0.25rem 0 0' }}>{formatCurrency(revenue?.dailyRevenue || 0)}</p>
        </div></div>
      </div>
      <div className="card"><div className="card-body">
        <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '1rem' }}>Revenue Overview</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sp-border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--sp-text-muted)', fontSize: 13 }} />
            <YAxis tick={{ fill: 'var(--sp-text-muted)', fontSize: 13 }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="amount" fill="var(--sp-sienna)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div></div>
    </div>
  )
}
