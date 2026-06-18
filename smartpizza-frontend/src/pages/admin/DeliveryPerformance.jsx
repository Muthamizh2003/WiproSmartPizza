import { useState, useEffect } from 'react'
import { Truck, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'

export const DeliveryPerformance = () => {
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDeliveryAnalytics().then(setDelivery).finally(() => setLoading(false))
  }, [])

  if (loading) return <StatsSkeleton />

  const deliveryStats = delivery?.deliveryStats || []
  const avgTime = delivery?.avgDeliveryTime || 0
  const onTimeRate = delivery?.onTimeRate || 0
  const totalDelivered = delivery?.totalDelivered || 0

  const statusMap = {}
  deliveryStats.forEach(([status, count]) => { statusMap[status] = count })

  const stats = [
    { label: 'Total Delivered', value: totalDelivered, icon: CheckCircle, color: 'var(--sp-sage)' },
    { label: 'In Transit', value: statusMap['OUT_FOR_DELIVERY'] || 0, icon: Truck, color: '#f59e0b' },
    { label: 'Avg Delivery Time', value: `${Math.round(avgTime)} min`, icon: Clock, color: 'var(--sp-sienna)' },
    { label: 'On-Time Rate', value: `${Math.round(onTimeRate * 100)}%`, icon: TrendingUp, color: 'var(--sp-sage)' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={28} style={{ color: 'var(--sp-sienna)' }} /> Delivery Performance
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={17} style={{ color: s.color }} />
                </div>
                <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>{s.label}</small>
              </div>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem' }}>Delivery Status Breakdown</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(statusMap).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--sp-warm-gray-light)' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{status?.replace(/_/g, ' ')}</span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'var(--sp-sienna)', color: '#fff', fontSize: '0.78rem', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
            {Object.keys(statusMap).length === 0 && (
              <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', margin: 0 }}>No delivery data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
