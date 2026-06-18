import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, LogIn, Tag, Loader2 } from 'lucide-react'
import { cartService } from '../../services/cartService'
import { couponService } from '../../services/couponService'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const CartPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    cartService.get(user.id).then(data => {
      setItems(Array.isArray(data) ? data : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0)
  const tax = subtotal * 0.05
  const discount = coupon ? coupon.discountAmount || 0 : 0
  const total = Math.max(0, subtotal + tax - discount)

  const updateQty = async (productId, qty) => {
    if (qty < 1) return
    try {
      await cartService.update(user.id, productId, qty)
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i))
    } catch { toast.error('Failed to update') }
  }

  const removeItem = async (productId) => {
    try {
      await cartService.remove(user.id, productId)
      setItems(prev => prev.filter(i => i.productId !== productId))
      toast.success('Item removed')
    } catch { toast.error('Failed to remove') }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplying(true)
    try {
      const res = await couponService.apply(couponCode.trim(), subtotal)
      setCoupon(res)
      toast.success('Coupon applied!')
    } catch { toast.error('Invalid coupon code'); setCoupon(null) }
    finally { setApplying(false) }
  }

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <ShoppingCart size={64} style={{ color: 'var(--sp-text-muted)', margin: '0 auto 1.25rem', display: 'block' }} />
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>Please login to view cart</h4>
      <button onClick={() => navigate('/login')} className="btn btn-pizza" style={{ gap: '0.5rem' }}>
        <LogIn size={18} /> Login
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={28} style={{ color: 'var(--sp-sienna)' }} /> Your Cart
        </h1>
      </div>

      {loading ? <TableSkeleton /> : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <ShoppingCart size={64} style={{ color: 'var(--sp-text-muted)', margin: '0 auto 1.25rem', display: 'block' }} />
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Your cart is empty</h4>
          <p style={{ color: 'var(--sp-text-muted)', marginBottom: '1.5rem' }}>Add some pizzas from the menu!</p>
          <Link to="/menu" className="btn btn-pizza" style={{ gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Browse Menu
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map(item => (
              <div key={item.productId} className="card">
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 'var(--radius-md)',
                    background: 'var(--sp-sienna-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <ShoppingCart size={22} style={{ color: 'var(--sp-sienna)' }} />
                  </div>
                  <div style={{ flex: '1 1 150px' }}>
                    <h6 style={{ fontWeight: 600, marginBottom: '0.15rem', fontSize: '0.95rem' }}>{item.productName}</h6>
                    <small style={{ color: 'var(--sp-text-muted)' }}>{formatCurrency(item.price)} each</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button className="btn btn-outline-secondary btn-sm" style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => updateQty(item.productId, item.quantity - 1)}><Minus size={14} /></button>
                    <span style={{ fontWeight: 600, minWidth: 28, textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button className="btn btn-outline-secondary btn-sm" style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => updateQty(item.productId, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, margin: 0, color: 'var(--sp-sienna)' }}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => removeItem(item.productId)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Order Summary</h5>
              <div style={{ height: 1, background: 'var(--sp-border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--sp-text-muted)' }}>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--sp-text-muted)' }}>Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--sp-sage)' }}>
                  <span>Discount ({coupon.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div style={{ height: 1, background: 'var(--sp-border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--sp-sienna)' }}>{formatCurrency(total)}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" className="form-control" placeholder="Coupon code" value={couponCode}
                  onChange={e => setCouponCode(e.target.value)} style={{ fontSize: '0.85rem' }} />
                <button className="btn btn-outline-pizza" onClick={applyCoupon} disabled={applying} style={{ whiteSpace: 'nowrap' }}>
                  <Tag size={14} /> {applying ? '...' : 'Apply'}
                </button>
              </div>
              {coupon && <p style={{ color: 'var(--sp-sage)', fontSize: '0.82rem', margin: 0 }}>{coupon.message}</p>}
              <button className="btn btn-pizza btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
