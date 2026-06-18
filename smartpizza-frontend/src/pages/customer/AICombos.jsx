import { useState } from 'react'
import { Sparkles, Pizza, ShoppingCart, Loader2 } from 'lucide-react'
import { comboService } from '../../services/comboService'
import { cartService } from '../../services/cartService'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AICombos = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [prompt, setPrompt] = useState('')
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState(null)

  const generateCombos = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const result = await comboService.getSmartCombo({ prompt: prompt.trim(), category: '' })
      setCombos(Array.isArray(result) ? result : [result])
    } catch {
      toast.error('Failed to generate combos')
    } finally {
      setLoading(false)
    }
  }

  const addComboToCart = async (combo) => {
    if (!user) { toast.error('Please login first'); return }
    setAddingId(combo.comboName)
    try {
      for (const p of combo.products) {
        await cartService.add(user.id, p.id, 1)
      }
      toast.success('Combo added to cart!')
    } catch {
      toast.error('Failed to add combo')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={28} style={{ color: 'var(--sp-sienna)' }} /> AI Smart Combos
        </h1>
      </div>

      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--sp-sienna-light), var(--sp-amber-light))',
        border: '1px solid var(--sp-border)'
      }}>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Describe your cravings</label>
            <input type="text" className="form-control" value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., I want a spicy veg combo for 2 people under 500"
              onKeyDown={e => e.key === 'Enter' && generateCombos()} />
          </div>
          <button onClick={generateCombos} disabled={loading || !prompt.trim()} className="btn btn-pizza" style={{ marginTop: '1.5rem' }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {combos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {combos.map((combo, idx) => (
            <div key={idx} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.25rem' }}>{combo.comboName}</h4>
                    {combo.aiSuggestion && <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', margin: 0 }}>{combo.aiSuggestion}</p>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--sp-sienna)' }}>{formatCurrency(combo.totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {(combo.products || []).map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--sp-warm-gray-light)'
                    }}>
                      <Pizza size={18} style={{ color: 'var(--sp-sienna)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{p.name}</p>
                        <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>{p.categoryName} · {p.size}</small>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{formatCurrency(p.price)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => addComboToCart(combo)} disabled={addingId === combo.comboName} className="btn btn-pizza">
                  {addingId === combo.comboName ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingCart size={18} />}
                  {addingId === combo.comboName ? 'Adding...' : 'Add Combo to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && combos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'var(--sp-sienna-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Sparkles size={48} style={{ color: 'var(--sp-sienna)' }} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No combos yet</h4>
          <p style={{ color: 'var(--sp-text-muted)', maxWidth: 400, margin: '0 auto' }}>
            Describe what you're craving and let AI create the perfect combo!
          </p>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
