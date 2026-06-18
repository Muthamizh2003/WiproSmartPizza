import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, X } from 'lucide-react'
import { addressSchema } from '../../utils/validators'
import { addressService } from '../../services/addressService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AddressForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema)
  })

  const onSubmit = async (data) => {
    if (!user) return
    setSubmitting(true)
    try {
      const address = await addressService.addAddress(user.id, data)
      toast.success('Address added successfully')
      onSuccess(address)
    } catch {
      toast.error('Failed to add address')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      padding: '1.25rem', borderRadius: 'var(--radius-md)',
      background: 'var(--sp-warm-gray-light)', marginTop: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={14} /> New Address
        </span>
        <button type="button" onClick={onCancel} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--sp-text-muted)', padding: '0.25rem', display: 'flex'
        }}>
          <X size={16} />
        </button>
      </div>
      <input type="text" {...register('street')} placeholder="Street address" className="form-control" style={{ fontSize: '0.85rem' }} />
      {errors.street && <p style={{ color: '#dc3545', fontSize: '0.78rem', margin: 0 }}>{errors.street.message}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <input type="text" {...register('city')} placeholder="City" className="form-control" style={{ fontSize: '0.85rem' }} />
          {errors.city && <p style={{ color: '#dc3545', fontSize: '0.78rem', margin: 0 }}>{errors.city.message}</p>}
        </div>
        <div>
          <input type="text" {...register('state')} placeholder="State" className="form-control" style={{ fontSize: '0.85rem' }} />
          {errors.state && <p style={{ color: '#dc3545', fontSize: '0.78rem', margin: 0 }}>{errors.state.message}</p>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <input type="text" {...register('pincode')} placeholder="Pincode" className="form-control" style={{ fontSize: '0.85rem' }} />
          {errors.pincode && <p style={{ color: '#dc3545', fontSize: '0.78rem', margin: 0 }}>{errors.pincode.message}</p>}
        </div>
        <div>
          <input type="text" {...register('landmark')} placeholder="Landmark" className="form-control" style={{ fontSize: '0.85rem' }} />
        </div>
      </div>
      <button type="submit" disabled={submitting} className="btn btn-pizza" style={{ width: '100%', fontSize: '0.85rem' }}>
        {submitting ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  )
}
