import { useState, useEffect } from 'react'
import { ClipboardList, MapPin, Phone, Package, Truck, CheckCircle } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { formatCurrency } from '../../utils/formatters'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const AssignedOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    deliveryService.getAssignedOrders().then(setOrders).finally(() => setLoading(false))
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
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>Order #{order.id}</strong>
              <span style={{
                padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em',
                background: order.orderStatus === 'OUT_FOR_DELIVERY' ? '#f59e0b18' : 'var(--sp-sage-light)',
                color: order.orderStatus === 'OUT_FOR_DELIVERY' ? '#f59e0b' : 'var(--sp-sage)'
              }}>
                {order.orderStatus?.replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={14} style={{ color: 'var(--sp-sienna)', flexShrink: 0 }} />
                <span>{order.itemNames?.join(', ') || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} style={{ color: '#dc3545', flexShrink: 0 }} />
                <span style={{ color: 'var(--sp-text-muted)' }}>{order.deliveryAddress || order.address || 'N/A'}</span>
              </div>
              {order.customerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} style={{ color: 'var(--sp-sage)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--sp-text-muted)' }}>{order.customerPhone}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--sp-border)' }}>
              <span style={{ fontWeight: 700, color: 'var(--sp-sage)' }}>{formatCurrency(order.totalPrice)}</span>
              <small style={{ color: 'var(--sp-text-muted)' }}>
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
              </small>
            </div>
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <ClipboardList size={36} style={{ color: 'var(--sp-warm-gray)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--sp-text-muted)', margin: 0 }}>No assigned orders right now</p>
          </div>
        )}
      </div>
    </div>
  )
}
