import { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield, Save, X, Loader2, Edit3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { userService } from '../../services/userService'
import { useToast } from '../../context/ToastContext'

export const UserProfile = () => {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [originalForm, setOriginalForm] = useState({ name: '', email: '', mobile: '' })
  const [form, setForm] = useState({ name: '', email: '', mobile: '' })

  useEffect(() => {
    if (user?.id) {
      setLoadingProfile(true)
      userService.getById(user.id).then(data => {
        const loaded = { name: data.name || '', email: data.email || '', mobile: data.mobile || '' }
        setForm(loaded)
        setOriginalForm(loaded)
      }).catch(() => {
        const fallback = { name: user?.name || '', email: user?.email || '', mobile: '' }
        setForm(fallback)
        setOriginalForm(fallback)
      }).finally(() => setLoadingProfile(false))
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const updated = await userService.update(user.id, form)
      updateUser({ name: updated.name, email: updated.email })
      setOriginalForm({ ...form })
      toast.success('Profile updated')
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ ...originalForm })
    setEditing(false)
  }

  const handleEdit = () => {
    setForm({ ...originalForm })
    setEditing(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={28} style={{ color: 'var(--sp-sienna)' }} /> My Profile
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-body" style={{ padding: '2rem 1.5rem' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'var(--sp-sienna-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <User size={44} style={{ color: 'var(--sp-sienna)' }} />
            </div>
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
              {loadingProfile ? '...' : (user?.name || 'User')}
            </h5>
            <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {(user?.roles || []).map(role => (
                <span key={role} className="badge bg-pizza-light text-pizza">
                  <Shield size={11} style={{ verticalAlign: '-1px', marginRight: '0.2rem' }} />
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Profile Details</h5>
              {!editing ? (
                <button onClick={handleEdit} className="btn btn-outline-pizza btn-sm" style={{ gap: '0.35rem' }}>
                  <Edit3 size={14} /> Edit
                </button>
              ) : (
                <span className="badge" style={{ background: 'var(--sp-sienna-light)', color: 'var(--sp-sienna)', padding: '0.4em 0.8em' }}>
                  Editing Mode
                </span>
              )}
            </div>

            {loadingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3].map(i => <div key={i} className="placeholder" style={{ height: 48 }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Name</label>
                  <div className="input-group">
                    <span className="input-group-text"><User size={15} /></span>
                    <input type="text" className="form-control" value={form.name} disabled={!editing}
                      onChange={e => setForm({...form, name: e.target.value})}
                      style={{ opacity: editing ? 1 : 0.7, background: editing ? 'var(--sp-bg-card)' : 'var(--sp-warm-gray-light)' }} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><Mail size={15} /></span>
                    <input type="email" className="form-control" value={form.email} disabled={!editing}
                      onChange={e => setForm({...form, email: e.target.value})}
                      style={{ opacity: editing ? 1 : 0.7, background: editing ? 'var(--sp-bg-card)' : 'var(--sp-warm-gray-light)' }} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Mobile</label>
                  <div className="input-group">
                    <span className="input-group-text"><Phone size={15} /></span>
                    <input type="text" className="form-control" value={form.mobile} disabled={!editing}
                      onChange={e => setForm({...form, mobile: e.target.value})}
                      style={{ opacity: editing ? 1 : 0.7, background: editing ? 'var(--sp-bg-card)' : 'var(--sp-warm-gray-light)' }} />
                  </div>
                </div>

                {editing && (
                  <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.5rem' }}>
                    <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.email.trim()}
                      className="btn btn-pizza" style={{ gap: '0.4rem' }}>
                      {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={handleCancel} className="btn btn-outline-secondary" style={{ gap: '0.4rem' }}>
                      <X size={15} /> Cancel
                    </button>
                  </div>
                )}

                {!editing && (
                  <div style={{
                    padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--sp-warm-gray-light)', fontSize: '0.85rem',
                    color: 'var(--sp-text-muted)'
                  }}>
                    Click the <strong>Edit</strong> button above to update your profile information.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
