import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, ShoppingCart } from 'lucide-react'

export const PaymentSuccess = () => {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '4rem 1rem', minHeight: '50vh'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'var(--sp-sage-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <CheckCircle size={56} style={{ color: 'var(--sp-sage)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--sp-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your order has been placed successfully.
        </p>
        {orderId && (
          <div style={{
            padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
            background: 'var(--sp-warm-gray-light)', marginBottom: '2rem'
          }}>
            <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.8rem' }}>Order ID</small>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '0.25rem 0 0' }}>#{orderId}</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <Link to="/orders" className="btn btn-pizza btn-lg" style={{ justifyContent: 'center', gap: '0.5rem' }}>
            <Package size={18} /> Track Order
          </Link>
          <Link to="/menu" className="btn btn-outline-secondary btn-lg" style={{ justifyContent: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={18} /> Order More
          </Link>
        </div>
      </div>
    </div>
  )
}
