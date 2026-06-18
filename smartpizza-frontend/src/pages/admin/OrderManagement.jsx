import { useState, useEffect } from 'react'
import { ClipboardList, Check, X, RefreshCw, Loader2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const loadOrders = async () => {
    try {
      const data = await adminService.getAllOrders()
      setOrders(data || [])
    } catch { return null }
  }

  useEffect(() => {
    setLoading(true)
    loadOrders().finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await adminService.updateOrderStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } catch { return null }
    finally { setUpdating(null) }
  }

  if (loading) return <TableSkeleton />

  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const completedOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status))

  const statusColors = {
    PLACED: 'var(--sp-amber)',
    CONFIRMED: 'var(--sp-sage)',
    PREPARING: 'var(--sp-sienna)',
    OUT_FOR_DELIVERY: '#f59e0b',
    DELIVERED: 'var(--sp-sage)',
    CANCELLED: '#dc3545'
  }

  const OrderCard = ({ order }) => (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>#{order.id}</strong>
          <small style={{ marginLeft: '0.5rem', color: 'var(--sp-text-muted)' }}>{order.userName}</small>
        </div>
        <span style={{
          padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em',
          background: `${statusColors[order.status] || 'var(--sp-warm-gray)'}18`,
          color: statusColors[order.status] || 'var(--sp-text-muted)'
        }}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>
      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>{order.items?.map(i => i.productName).join(', ') || 'N/A'}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--sp-sage)' }}>{formatCurrency(order.totalAmount)}</span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {order.status === 'PLACED' && (
            <button onClick={() => updateStatus(order.id, 'CONFIRMED')} disabled={updating === order.id} className="btn btn-sm btn-pizza" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
              {updating === order.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />} Confirm
            </button>
          )}
          {['CONFIRMED', 'PREPARING'].includes(order.status) && (
            <>
              <button onClick={() => updateStatus(order.id, order.status === 'CONFIRMED' ? 'PREPARING' : 'OUT_FOR_DELIVERY')} disabled={updating === order.id} className="btn btn-sm btn-pizza" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                {updating === order.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />} Next Step
              </button>
              <button onClick={() => updateStatus(order.id, 'CANCELLED')} disabled={updating === order.id} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#dc3545' }}>
                <X size={12} />
              </button>
            </>
          )}
        </div>
      </div>
      <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem', marginTop: '0.5rem', display: 'block' }}>
        {formatDate(order.createdAt)}
      </small>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={28} style={{ color: 'var(--sp-sienna)' }} /> Orders
        </h1>
      </div>

      <div>
        <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Active Orders</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {activeOrders.length > 0 ? activeOrders.map(order => <OrderCard key={order.id} order={order} />) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--sp-text-muted)' }}>No active orders</div>
          )}
        </div>
      </div>

      <div>
        <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Completed Orders</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {completedOrders.length > 0 ? completedOrders.map(order => <OrderCard key={order.id} order={order} />) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--sp-text-muted)' }}>No completed orders</div>
          )}
        </div>
      </div>
    </div>
  )
}
