import { useState, useEffect } from 'react'
import { Ticket, Plus, Pencil, Trash2, Loader2, Save } from 'lucide-react'
import { couponService } from '../../services/couponService'
import { formatDate } from '../../utils/formatters'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ code: '', discount: '', type: 'PERCENTAGE', minOrderAmount: '', expiryDate: '' })

  useEffect(() => {
    setLoading(true)
    couponService.getAll().then(setCoupons).finally(() => setLoading(false))
  }, [])

  const resetForm = () => setForm({ code: '', discount: '', type: 'PERCENTAGE', minOrderAmount: '', expiryDate: '' })

  const startEdit = (c) => { setEditingId(c.id); setAdding(false); setForm({ code: c.code || '', discount: c.discount || '', type: c.type || 'PERCENTAGE', minOrderAmount: c.minOrderAmount || '', expiryDate: c.expiryDate?.slice(0,10) || '' }) }
  const startAdd = () => { setAdding(true); setEditingId(null); resetForm() }
  const cancel = () => { setEditingId(null); setAdding(false); resetForm() }

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount) return
    setSaving(true)
    try {
      const payload = { ...form, discount: Number(form.discount), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null }
      if (editingId) {
        await couponService.update(editingId, payload)
        setCoupons(prev => prev.map(c => c.id === editingId ? { ...c, ...payload } : c))
      } else {
        const saved = await couponService.create(payload)
        setCoupons(prev => [...prev, saved])
      }
      cancel()
    } catch { return null }
    finally { setSaving(false) }
  }

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    try { await couponService.delete(id); setCoupons(prev => prev.filter(c => c.id !== id)) } catch { return null }
  }

  if (loading) return <TableSkeleton />

  const isEditing = editingId !== null || adding

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ticket size={28} style={{ color: 'var(--sp-sienna)' }} /> Coupons
          </h1>
        </div>
        <button onClick={startAdd} className="btn btn-pizza btn-sm"><Plus size={15} /> Add Coupon</button>
      </div>

      {isEditing && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem' }}>{editingId ? 'Edit Coupon' : 'Add Coupon'}</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div><label className="form-label">Code *</label><input type="text" className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} /></div>
            <div><label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="PERCENTAGE">Percentage</option><option value="FLAT">Flat</option>
              </select></div>
            <div><label className="form-label">Discount *</label><input type="number" className="form-control" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} /></div>
            <div><label className="form-label">Min Order Amount</label><input type="number" className="form-control" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} /></div>
            <div><label className="form-label">Expiry</label><input type="date" className="form-control" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1rem' }}>
            <button onClick={cancel} className="btn btn-outline-secondary btn-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.code.trim() || !form.discount} className="btn btn-pizza btn-sm">
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {coupons.map(c => (
          <div key={c.id} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'var(--sp-sage)', color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}>
                {c.type}
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => startEdit(c)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.25rem 0.5rem' }}><Pencil size={12} /></button>
                <button onClick={() => deleteCoupon(c.id)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.25rem 0.5rem', color: '#dc3545' }}><Trash2 size={12} /></button>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--sp-sienna)', marginBottom: '0.25rem' }}>{c.code}</div>
            <div style={{ fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span style={{ fontWeight: 600 }}>{c.type === 'PERCENTAGE' ? `${c.discount}%` : `₹${c.discount}`}</span></div>
              {c.minOrderAmount && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Min Order</span><span>₹{c.minOrderAmount}</span></div>}
              {c.expiryDate && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Expires</span><span>{formatDate(c.expiryDate)}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
