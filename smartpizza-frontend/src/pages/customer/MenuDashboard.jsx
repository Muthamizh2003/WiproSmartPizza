import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Pizza, Search, X, SlidersHorizontal } from 'lucide-react'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/formatters'
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton'

export const MenuDashboard = () => {
  const [searchParams] = useSearchParams()
  const catFilter = searchParams.get('category')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState(catFilter || '')
  const [filterSize, setFilterSize] = useState('')
  const sizes = ['Small', 'Medium', 'Large', 'Extra Large']

  useEffect(() => {
    productService.getAll().then(data => {
      setProducts(data)
      const cats = [...new Set(data.map(p => p.categoryName).filter(Boolean))]
      setCategories(cats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCat && p.categoryName !== filterCat) return false
    if (filterSize && p.size !== filterSize) return false
    return true
  })

  const hasFilters = search || filterCat || filterSize

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Pizza size={28} style={{ color: 'var(--sp-sienna)' }} /> Menu
        </h1>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center',
        padding: '1rem 1.25rem', background: 'var(--sp-bg-card)',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--sp-border)'
      }}>
        <SlidersHorizontal size={16} style={{ color: 'var(--sp-text-muted)' }} />
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--sp-text-muted)' }} />
          <input type="text" className="form-control" placeholder="Search pizza..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.88rem' }} />
        </div>
        <select className="form-select" style={{ maxWidth: 160, fontSize: '0.88rem' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth: 140, fontSize: '0.88rem' }} value={filterSize} onChange={e => setFilterSize(e.target.value)}>
          <option value="">All Sizes</option>
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { setSearch(''); setFilterCat(''); setFilterSize('') }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? <ProductGridSkeleton /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'var(--sp-warm-gray-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Pizza size={48} style={{ color: 'var(--sp-text-muted)' }} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No pizzas found</h4>
          <p style={{ color: 'var(--sp-text-muted)' }}>Try a different category or search term</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(p => (
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
                <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.2rem' }}>{p.name}</h5>
                <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.15rem' }}>
                  {p.categoryName}{p.size ? ` · ${p.size}` : ''}
                </p>
                {p.description && (
                  <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem', textAlign: 'center', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {p.description.length > 80 ? p.description.slice(0, 80) + '...' : p.description}
                  </p>
                )}
                <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--sp-sienna)', marginBottom: '0.75rem' }}>
                    {formatCurrency(p.price)}
                  </p>
                  <Link to={`/menu/${p.id}`} className="btn btn-pizza btn-sm" style={{ width: '100%' }}>View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
