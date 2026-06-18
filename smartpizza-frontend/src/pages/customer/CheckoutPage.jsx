import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Plus, Percent, X, Loader2 } from 'lucide-react'
import { cartService } from '../../services/cartService'
import { addressService } from '../../services/addressService'
import { couponService } from '../../services/couponService'
import { orderService } from '../../services/orderService'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AddressForm } from '../../components/customer/AddressForm'

export const CheckoutPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      cartService.get(user.id),
      addressService.getUserAddresses(user.id)
    ]).then(([cartData, addrData]) => {
      setItems(Array.isArray(cartData) ? cartData : [])
      setAddresses(Array.isArray(addrData) ? addrData : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0)
  const tax = subtotal * 0.05
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const total = subtotal + tax - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const result = await couponService.apply(couponCode.trim(), subtotal + tax)
      setAppliedCoupon(result)
      toast.success(`Coupon applied: ${result.message}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode('') }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    if (items.length === 0) { toast.error('Cart is empty'); return }
    setPlacing(true)
    try {
      const order = await orderService.place(user.id, selectedAddress, appliedCoupon?.code || null)
      try { await cartService.clear(user.id) } catch {}
      navigate(`/payment-success?orderId=${order.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner-border" /></div>

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={28} style={{ color: 'var(--sp-sienna)' }} /> Checkout
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-body">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--sp-sienna)' }} /> Delivery Address
              </h5>
              {addresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => setSelectedAddress(addr.id)} style={{
                      padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${selectedAddress === addr.id ? 'var(--sp-sienna)' : 'var(--sp-border)'}`,
                      background: selectedAddress === addr.id ? 'var(--sp-sienna-light)' : 'transparent',
                      cursor: 'pointer', transition: 'all 200ms ease'
                    }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{addr.street}, {addr.city}</p>
                      <small style={{ color: 'var(--sp-text-muted)' }}>{addr.state} - {addr.pincode}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.88rem' }}>No addresses saved. Add one below.</p>
              )}
              {!showAddressForm ? (
                <button onClick={() => setShowAddressForm(true)} className="btn btn-outline-pizza btn-sm" style={{ marginTop: '0.75rem', gap: '0.35rem' }}>
                  <Plus size={15} /> Add New Address
                </button>
              ) : (
                <AddressForm onSuccess={(addr) => { setAddresses(prev => [...prev, addr]); setSelectedAddress(addr.id); setShowAddressForm(false) }}
                  onCancel={() => setShowAddressForm(false)} />
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0 }}>Order Summary</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--sp-text-muted)' }}>{item.productName} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: 'var(--sp-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--sp-text-muted)' }}>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--sp-text-muted)' }}>Tax (5%)</span><span>{formatCurrency(tax)}</span>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--sp-warm-gray-light)' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Percent size={15} style={{ color: 'var(--sp-sage)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sp-sage)' }}>{appliedCoupon.code}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--sp-text-muted)' }}>-{formatCurrency(discount)}</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="btn btn-outline-danger btn-sm" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code" className="form-control" style={{ fontSize: '0.85rem' }} />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="btn btn-pizza btn-sm">
                    <Percent size={14} /> {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--sp-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem' }}>
              <span>Total</span><span style={{ color: 'var(--sp-sienna)' }}>{formatCurrency(total)}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing || !selectedAddress} className="btn btn-pizza btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {placing ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={20} />}
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
