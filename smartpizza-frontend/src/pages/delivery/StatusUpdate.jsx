import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation, ArrowLeft, Loader2 } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { useToast } from '../../context/ToastContext'

const STATUSES = ['OUT_FOR_DELIVERY', 'DELIVERED']

export const StatusUpdate = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [deliveryId, setDeliveryId] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    if (!deliveryId || !newStatus) { toast.error('Please fill all fields'); return }
    setUpdating(true)
    try {
      await deliveryService.updateStatus(Number(deliveryId), newStatus)
      toast.success('Status updated!')
      setDeliveryId(''); setNewStatus('')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm" style={{ alignSelf: 'flex-start', gap: '0.35rem' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={28} style={{ color: 'var(--sp-sienna)' }} /> Update Status
        </h1>
      </div>
      <div className="card" style={{ padding: '1.5rem', maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Delivery ID</label>
            <input type="number" className="form-control" value={deliveryId} onChange={e => setDeliveryId(e.target.value)} placeholder="Enter delivery ID" />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>New Status</label>
            <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">Select status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <button onClick={handleUpdate} disabled={updating || !deliveryId || !newStatus} className="btn btn-pizza">
            {updating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={16} />} {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
