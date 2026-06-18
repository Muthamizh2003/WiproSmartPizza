import { useState, useEffect } from 'react'
import { Pizza, Plus, Pencil, Trash2, Loader2, Save } from 'lucide-react'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/formatters'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const MenuManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', size: '', categoryName: '' })

  useEffect(() => {
    setLoading(true)
    productService.getAll().then(setProducts).finally(() => setLoading(false))
  }, [])

  const resetForm = () => setForm({ name: '', description: '', price: '', size: '', categoryName: '' })

  const startEdit = (p) => { setEditingId(p.id); setAdding(false); setForm({ name: p.name || '', description: p.description || '', price: p.price || '', size: p.size || '', categoryName: p.categoryName || '' }) }
  const startAdd = () => { setAdding(true); setEditingId(null); resetForm() }
  const cancel = () => { setEditingId(null); setAdding(false); resetForm() }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editingId) {
        await productService.update(editingId, payload)
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...payload } : p))
      } else {
        const saved = await productService.add(payload)
        setProducts(prev => [...prev, saved])
      }
      cancel()
    } catch { return null }
    finally { setSaving(false) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await productService.delete(id); setProducts(prev => prev.filter(p => p.id !== id)) } catch { return null }
  }

  if (loading) return <TableSkeleton />

  const isEditing = editingId !== null || adding

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pizza size={28} style={{ color: 'var(--sp-sienna)' }} /> Menu Management
          </h1>
        </div>
        <button onClick={startAdd} className="btn btn-pizza btn-sm"><Plus size={15} /> Add Product</button>
      </div>

      {isEditing && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem' }}>{editingId ? 'Edit Product' : 'Add Product'}</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label className="form-label">Name *</label>
              <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Price *</label>
              <input type="number" className="form-control" value={form.price} onChange={e => setForm({...form, price: e.target.value})} step="0.01" />
            </div>
            <div>
              <label className="form-label">Size *</label>
              <select className="form-select" value={form.size} onChange={e => setForm({...form, size: e.target.value})}>
                <option value="">Select size</option>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category *</label>
              <input type="text" className="form-control" value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})} placeholder="e.g. Veg, Non-Veg" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description *</label>
              <input type="text" className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1rem' }}>
            <button onClick={cancel} className="btn btn-outline-secondary btn-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price} className="btn btn-pizza btn-sm">
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {products.map(p => (
          <div key={p.id} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, background: 'var(--sp-sage)', color: '#fff' }}>
                {p.categoryName || 'N/A'}
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => startEdit(p)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.25rem 0.5rem' }}><Pencil size={12} /></button>
                <button onClick={() => deleteProduct(p.id)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.25rem 0.5rem', color: '#dc3545' }}><Trash2 size={12} /></button>
              </div>
            </div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{p.name}</strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--sp-text-muted)', margin: '0.25rem 0' }}>{p.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--sp-sage)' }}>{formatCurrency(p.price)}</span>
              <small style={{ color: 'var(--sp-text-muted)' }}>{p.size}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
