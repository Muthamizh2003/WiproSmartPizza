import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pizza, ShoppingCart, ArrowLeft, Minus, Plus, Loader2 } from 'lucide-react'
import { productService } from '../../services/productService'
import { cartService } from '../../services/cartService'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const PizzaDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    productService.getById(id)
      .then(setProduct)
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    if (!product) return
    setAdding(true)
    try {
      await cartService.add(user.id, product.id, qty)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner-border" role="status" />
    </div>
  )

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '1rem' }}>Product not found</h4>
      <button onClick={() => navigate('/menu')} className="btn btn-pizza">Back to Menu</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline-secondary" style={{ alignSelf: 'flex-start', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 300px', minHeight: 300,
            background: 'linear-gradient(135deg, var(--sp-sienna-light), var(--sp-cream-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '3rem'
          }}>
            <div style={{
              width: 180, height: 180, borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Pizza size={88} style={{ color: 'var(--sp-sienna)' }} />
            </div>
          </div>

          <div style={{ flex: '1 1 400px', padding: '2rem' }}>
            <span className="badge bg-pizza-light text-pizza" style={{ marginBottom: '0.75rem' }}>
              {product.categoryName}
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {product.name}
            </h2>
            {product.size && (
              <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Size: {product.size}
              </p>
            )}
            <p style={{ color: 'var(--sp-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description || 'A delicious pizza made with fresh ingredients and authentic flavors.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--sp-sienna)' }}>
                {formatCurrency(product.price)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--sp-border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  width: 40, height: 40, border: 'none', background: 'var(--sp-warm-gray-light)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Minus size={16} />
                </button>
                <span style={{ width: 48, textAlign: 'center', fontWeight: 600, fontSize: '1rem' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{
                  width: 40, height: 40, border: 'none', background: 'var(--sp-warm-gray-light)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Plus size={16} />
                </button>
              </div>
              <span style={{ color: 'var(--sp-text-muted)', fontSize: '0.9rem' }}>
                Total: <strong style={{ color: 'var(--sp-sienna)' }}>{formatCurrency(product.price * qty)}</strong>
              </span>
            </div>

            <button onClick={handleAddToCart} disabled={adding} className="btn btn-pizza btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {adding ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingCart size={20} />}
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
