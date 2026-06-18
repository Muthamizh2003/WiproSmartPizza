import { useState, useEffect } from 'react'
import { ClipboardList, MapPin, Package, Navigation } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const AssignedOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    deliveryService.getAgentOrders().then(data => setOrders(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <TableSkeleton />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={28} style={{ color: 'var(--sp-sienna)' }} /> Assigned Orders
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
        {orders.length > 0 ? orders.map(order => (
          <div key={order.id} className="card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>Delivery #{order.id}</strong>
              <span style={{
                padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em',
                background: order.status === 'OUT_FOR_DELIVERY' ? '#f59e0b18' : 'var(--sp-sage-light)',
                color: order.status === 'OUT_FOR_DELIVERY' ? '#f59e0b' : 'var(--sp-sage)'
              }}>
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={14} style={{ color: 'var(--sp-sienna)', flexShrink: 0 }} />
                <span>Order #{order.orderId}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Navigation size={14} style={{ color: 'var(--sp-sage)', flexShrink: 0 }} />
                <span style={{ color: 'var(--sp-text-muted)' }}>{order.agentName}</span>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--sp-border)' }}>
              <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>
                Location: {order.latitude?.toFixed(4)}, {order.longitude?.toFixed(4)}
              </small>
            </div>
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <ClipboardList size={36} style={{ color: 'var(--sp-warm-gray)', margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--sp-text-muted)', margin: 0 }}>No assigned orders right now</p>
          </div>
        )}
      </div>
    </div>
  )
}
