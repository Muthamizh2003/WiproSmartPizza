import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, Truck } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'

export const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    deliveryService.getAgentOrders().then(data => setOrders(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <StatsSkeleton />

  const inTransit = orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length
  const delivered = orders.filter(o => o.status === 'DELIVERED').length

  const cards = [
    { label: 'Assigned Orders', value: orders.length, icon: ClipboardList, color: 'var(--sp-amber)' },
    { label: 'In Transit', value: inTransit, icon: Truck, color: 'var(--sp-sienna)' },
    { label: 'Delivered', value: delivered, icon: LayoutDashboard, color: 'var(--sp-sage)' }
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

      <div className="card">
        <div className="card-body">
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>Recent Orders</h5>
          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--sp-warm-gray-light)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Order #{o.orderId}</span>
                  <span style={{
                    padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.68rem', fontWeight: 600,
                    background: o.status === 'DELIVERED' ? 'var(--sp-sage)' : 'var(--sp-amber)',
                    color: '#fff'
                  }}>{o.status?.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', margin: 0 }}>No orders assigned yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
