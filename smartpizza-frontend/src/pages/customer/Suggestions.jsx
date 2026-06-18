import { useState, useEffect } from 'react'
import { Sparkles, ShoppingCart, Pizza, Sun, History, Package, Loader2 } from 'lucide-react'
import { aiService } from '../../services/aiService'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { cartService } from '../../services/cartService'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton'

const SEASONS = ['Summer', 'Winter', 'Monsoon']

export const Suggestions = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('personalized')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [season, setSeason] = useState('Summer')
  const [addingId, setAddingId] = useState(null)

  useEffect(() => {
    if (user) loadSuggestions()
  }, [tab, season, user])

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      if (tab === 'personalized') {
        const orders = await orderService.getUserOrders(user.id).catch(() => [])
        const allProducts = await productService.getAll().catch(() => [])
        if (orders.length === 0 || !Array.isArray(orders)) {
          setProducts(allProducts.slice(0, 8))
          return
        }
        const favCategoryIds = [...new Set(
          orders.flatMap(o => o.items || []).map(i => i.categoryName || i.productName).filter(Boolean)
        )]
        const filtered = allProducts.filter(p => favCategoryIds.includes(p.categoryName))
        setProducts(filtered.length > 0 ? filtered : allProducts.slice(0, 8))
      } else {
        const result = await aiService.recommend({ season: season.toUpperCase(), prompt: `Suggest products suitable for ${season} season` })
        const seen = new Set()
        const flat = (result || []).flatMap(r => r.products || []).filter(p => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })
        setProducts(flat.length > 0 ? flat : [])
      }
    } catch {
      toast.error('Failed to load suggestions')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    if (!user) { toast.error('Please login'); return }
    setAddingId(product.id)
    try {
      await cartService.add(user.id, product.id, 1)
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAddingId(null)
    }
  }

  const tabs = [
    { key: 'personalized', icon: History, label: 'Based on Your Orders' },
    { key: 'seasonal', icon: Sun, label: 'Seasonal Picks' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={28} style={{ color: 'var(--sp-sienna)' }} /> Suggestions
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn btn-pizza' : 'btn btn-outline-secondary'}
            style={{ gap: '0.4rem' }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'seasonal' && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Season:</span>
          {SEASONS.map(s => (
            <button key={s} onClick={() => setSeason(s)}
              className={season === s ? 'btn btn-pizza btn-sm' : 'btn btn-outline-secondary btn-sm'}>
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'var(--sp-warm-gray-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Package size={48} style={{ color: 'var(--sp-text-muted)' }} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No suggestions yet</h4>
          <p style={{ color: 'var(--sp-text-muted)' }}>
            {tab === 'personalized' ? 'Place some orders to get personalized recommendations!' : 'Try a different season'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {products.map(p => (
            <div key={p.id} className="card card-lift">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--sp-sienna-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Pizza size={36} style={{ color: 'var(--sp-sienna)' }} />
                </div>
                <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.25rem' }}>{p.name}</h5>
                <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.15rem' }}>
                  {p.categoryName}{p.size ? ` · ${p.size}` : ''}
                </p>
                {p.description && (
                  <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem', textAlign: 'center', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {p.description.length > 60 ? p.description.slice(0, 60) + '...' : p.description}
                  </p>
                )}
                <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--sp-sienna)', marginBottom: '0.75rem' }}>
                    {formatCurrency(p.price)}
                  </p>
                  <button onClick={() => addToCart(p)} disabled={addingId === p.id}
                    className="btn btn-pizza btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    {addingId === p.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingCart size={16} />}
                    {addingId === p.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
