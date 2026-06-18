import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pizza, TrendingUp, Sparkles, ArrowRight, Star } from 'lucide-react'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/formatters'
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton'

export const HomePage = () => {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getTopExpensive()
      .then(setFeatured)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = [
    { name: 'Veg Pizza', icon: '🍕', color: '#4a7c59', bg: '#e8f5ec' },
    { name: 'Non-Veg Pizza', icon: '🍗', color: '#c2410c', bg: '#fff1e6' },
    { name: 'Sides', icon: '🧀', color: '#d4a373', bg: '#fdf4ec' },
    { name: 'Beverages', icon: '🥤', color: '#6b7280', bg: '#f3f0ec' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <section style={{
        background: 'linear-gradient(135deg, var(--sp-sienna) 0%, #9a3412 60%, #7c2d12 100%)',
        borderRadius: 'var(--radius-xl)', padding: 'clamp(2rem, 5vw, 4rem)',
        position: 'relative', overflow: 'hidden', color: '#fff', textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.1, marginBottom: '1rem'
          }}>
            Your AI-Powered<br />Pizza Experience
          </h1>
          <p style={{ opacity: 0.88, maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.6, fontSize: '1.05rem' }}>
            Discover pizzas crafted with AI recommendations, smart combos, and real-time delivery tracking.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn" style={{
              background: '#fff', color: 'var(--sp-sienna)', fontWeight: 600,
              padding: '0.75rem 2rem', fontSize: '1rem'
            }}>
              Order Now <ArrowRight size={18} />
            </Link>
            <Link to="/ai-combos" className="btn" style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 500,
              border: '2px solid rgba(255,255,255,0.3)', padding: '0.75rem 2rem', fontSize: '1rem'
            }}>
              <Sparkles size={18} /> AI Combos
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="accent-line" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', margin: 0 }}>
            <TrendingUp size={22} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--sp-sienna)' }} />
            Top Picks
          </h2>
        </div>
        {loading ? <ProductGridSkeleton /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {featured.map(p => (
              <div key={p.id} className="card card-lift" style={{ cursor: 'pointer' }}>
                <div className="card-body" style={{ textAlign: 'center', padding: '1.75rem' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--sp-sienna-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Pizza size={36} style={{ color: 'var(--sp-sienna)' }} />
                  </div>
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{p.name}</h5>
                  <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{p.categoryName}</p>
                  <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--sp-sienna)', marginBottom: '1rem' }}>{formatCurrency(p.price)}</p>
                  <Link to={`/menu/${p.id}`} className="btn btn-outline-pizza btn-sm" style={{ width: '100%' }}>View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="accent-line" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', margin: 0 }}>Categories</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {categories.map(cat => (
            <Link key={cat.name} to={`/menu?category=${cat.name.toLowerCase()}`} style={{ textDecoration: 'none' }}>
              <div className="card card-lift" style={{
                textAlign: 'center', padding: '1.75rem 1rem',
                background: cat.bg, border: 'none', cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                <h6 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: cat.color, margin: 0 }}>{cat.name}</h6>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
