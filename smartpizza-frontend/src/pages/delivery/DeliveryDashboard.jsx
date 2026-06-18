import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Clock, CheckCircle, RefreshCw } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'

export const DeliveryDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    deliveryService.getDashboard().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <StatsSkeleton />

  const assigned = stats?.assignedOrders ?? stats?.assigned ?? 0
  const inTransit = stats?.inTransitOrders ?? stats?.inTransit ?? 0
  const delivered = stats?.deliveredOrders ?? stats?.delivered ?? 0

  const cards = [
    { label: 'Assigned Orders', value: assigned, icon: ClipboardList, color: 'var(--sp-amber)' },
    { label: 'In Transit', value: inTransit, icon: Clock, color: 'var(--sp-sienna)' },
    { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'var(--sp-sage)' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={28} style={{ color: 'var(--sp-sienna)' }} /> Delivery Dashboard
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        {cards.map(c => (
          <div key={c.label} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <c.icon size={19} style={{ color: c.color }} />
                </div>
                <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.82rem' }}>{c.label}</small>
              </div>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
