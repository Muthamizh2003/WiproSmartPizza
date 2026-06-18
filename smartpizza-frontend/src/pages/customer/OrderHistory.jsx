import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, MapPin, Eye, CreditCard, FileText, X } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { paymentService } from '../../services/paymentService'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { STATUS_COLORS } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const OrderHistory = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingOrderId, setPayingOrderId] = useState(null)
  const [paying, setPaying] = useState(false)
  const [invoiceOrderId, setInvoiceOrderId] = useState(null)
  const [invoiceText, setInvoiceText] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  useEffect(() => { if (user) loadOrders() }, [user])

  const loadOrders = () => {
    setLoading(true)
    orderService.getUserOrders(user.id)
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handlePay = async (orderId) => {
    setPaying(true)
    try {
      const payment = await paymentService.pay({ orderId, paymentMethod: 'CARD' })
      if (payment) { toast.success('Payment successful!'); setPayingOrderId(null); loadOrders() }
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed') }
    finally { setPaying(false) }
  }

  const handleInvoice = async (orderId) => {
    setInvoiceOrderId(orderId); setInvoiceLoading(true)
    try { const text = await paymentService.invoice(orderId); setInvoiceText(text) }
    catch { toast.error('Failed to load invoice'); setInvoiceOrderId(null) }
    finally { setInvoiceLoading(false) }
  }

  const total = (order) => order.totalAmount + (order.taxAmount || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={28} style={{ color: 'var(--sp-sienna)' }} /> My Orders
        </h1>
      </div>

      {loading ? <TableSkeleton /> : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={64} style={{ color: 'var(--sp-text-muted)', margin: '0 auto 1.25rem', display: 'block' }} />
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No orders yet</h4>
          <p style={{ color: 'var(--sp-text-muted)', marginBottom: '1.5rem' }}>Order your first pizza!</p>
          <Link to="/menu" className="btn btn-pizza">Browse Menu</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>Order #{order.id}</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--sp-text-muted)' }}>
                      <Clock size={13} /> {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status] || 'bg-secondary'}`} style={{ textTransform: 'capitalize' }}>
                    {order.status?.replace(/_/g, ' ') || 'N/A'}
                  </span>
                </div>
                {order.deliveryAddress && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--sp-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    <MapPin size={13} /> {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {(order.items || []).map((item, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--sp-warm-gray-light)', color: 'var(--sp-text)' }}>
                      {item.productName} x{item.quantity}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--sp-sienna)' }}>{formatCurrency(total(order))}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {order.status === 'PENDING_PAYMENT' && (
                      <button onClick={() => setPayingOrderId(order.id)} className="btn btn-pizza btn-sm">
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )}
                    {['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                      <Link to={`/tracking/${order.id}`} className="btn btn-outline-pizza btn-sm">
                        <Eye size={14} /> Track
                      </Link>
                    )}
                    {!['PENDING_PAYMENT', 'CANCELLED'].includes(order.status) && (
                      <button onClick={() => handleInvoice(order.id)} className="btn btn-outline-secondary btn-sm">
                        <FileText size={14} /> Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {payingOrderId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'var(--sp-bg-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 420, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--sp-border)' }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} style={{ color: 'var(--sp-sienna)' }} /> Complete Payment
              </h5>
              <button onClick={() => setPayingOrderId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <CreditCard size={56} style={{ color: 'var(--sp-sienna)', margin: '0 auto 1rem' }} />
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Pay for Order #{payingOrderId}</h5>
              <p style={{ color: 'var(--sp-text-muted)', marginBottom: '0.5rem' }}>Total: {formatCurrency(total(orders.find(o => o.id === payingOrderId)))}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--sp-text-muted)' }}>Payment will be processed via simulated gateway</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--sp-border)' }}>
              <button onClick={() => setPayingOrderId(null)} className="btn btn-outline-secondary">Cancel</button>
              <button onClick={() => handlePay(payingOrderId)} disabled={paying} className="btn btn-pizza">
                <CreditCard size={16} /> {paying ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {invoiceOrderId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'var(--sp-bg-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 500, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--sp-border)' }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} style={{ color: 'var(--sp-sienna)' }} /> Invoice - Order #{invoiceOrderId}
              </h5>
              <button onClick={() => { setInvoiceOrderId(null); setInvoiceText('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {invoiceLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--sp-text-muted)' }}>Loading invoice...</div>
              ) : (
                <pre style={{ fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: 0, color: 'var(--sp-text)' }}>{invoiceText}</pre>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--sp-border)' }}>
              <button onClick={() => { setInvoiceOrderId(null); setInvoiceText('') }} className="btn btn-outline-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
