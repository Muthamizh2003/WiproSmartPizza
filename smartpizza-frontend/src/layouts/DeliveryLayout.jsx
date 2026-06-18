import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Map, Navigation, LogOut, Menu, X, User, Edit3, Save, Mail, Phone, ChevronDown, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import { useToast } from '../context/ToastContext'
import { ThemeToggle } from '../components/common/ThemeToggle'

const links = [
  { to: '/delivery', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/delivery/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/delivery/route', icon: Map, label: 'Route' },
  { to: '/delivery/status', icon: Navigation, label: 'Status' }
]

export const DeliveryLayout = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const dropdownRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '' })

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const openEditProfile = async () => {
    if (!user?.id) return
    setShowDropdown(false)
    setLoadingProfile(true)
    try {
      const data = await userService.getById(user.id)
      setForm({ name: data.name || '', email: data.email || '', mobile: data.mobile || '' })
      setShowModal(true)
    } catch { toast.error('Failed to load profile') }
    finally { setLoadingProfile(false) }
  }

  const closeEditProfile = () => { setShowModal(false); setForm({ name: '', email: '', mobile: '' }) }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return }
    setSaving(true)
    try {
      const updated = await userService.update(user.id, form)
      updateUser({ name: updated.name, email: updated.email })
      toast.success('Profile updated')
      closeEditProfile()
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const isActive = (to) => location.pathname === to

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} />}

      <aside style={{
        width: 240, minHeight: '100vh', position: sidebarOpen ? 'fixed' : 'relative',
        zIndex: 100, background: 'var(--sp-charcoal)', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '1.25rem',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 300ms ease'
      }}
      className={sidebarOpen ? '' : 'd-none d-md-flex'}
      >
        <Link to="/delivery" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
          <Navigation size={20} style={{ color: 'var(--sp-sage)' }} /> Delivery
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)',
              color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive(link.to) ? 'var(--sp-sienna)' : 'transparent',
              textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
              transition: 'all 200ms ease'
            }}
            onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' } }}
            >
              <link.icon size={17} /> {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />

        <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
          ← Back to Site
        </Link>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowDropdown(!showDropdown)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
            color: '#fff', width: '100%', cursor: 'pointer', fontSize: '0.85rem'
          }}>
            <User size={15} /> <span style={{ flex: 1, textAlign: 'left' }}>{user?.name || 'Account'}</span>
            <ChevronDown size={14} style={{ opacity: 0.5 }} />
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '0.4rem', zIndex: 1050
            }}>
              <button onClick={openEditProfile} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', color: 'var(--sp-text)', background: 'none',
                border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--sp-sienna-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {loadingProfile ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Edit3 size={14} />}
                Edit Profile
              </button>
              <div style={{ height: 1, background: 'var(--sp-border)', margin: '0.3rem 0' }} />
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', color: '#dc3545', background: 'none',
                border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <nav style={{
          background: 'var(--sp-bg-card)', borderBottom: '1px solid var(--sp-border)',
          padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}
        className="d-md-none"
        >
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-outline-secondary btn-sm" style={{ padding: '0.35rem' }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Delivery</span>
          <ThemeToggle />
        </nav>

        <main style={{ flex: 1, padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'var(--sp-bg-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--sp-border)' }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: 'var(--sp-sienna)' }} /> Edit Profile
              </h5>
              <button onClick={closeEditProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Name</label>
                <div className="input-group"><span className="input-group-text"><User size={15} /></span>
                  <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <div className="input-group"><span className="input-group-text"><Mail size={15} /></span>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div>
                <label className="form-label">Mobile</label>
                <div className="input-group"><span className="input-group-text"><Phone size={15} /></span>
                  <input type="text" className="form-control" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--sp-border)' }}>
              <button onClick={closeEditProfile} className="btn btn-outline-secondary"><X size={15} /> Cancel</button>
              <button onClick={handleSaveProfile} disabled={saving || !form.name.trim() || !form.email.trim()} className="btn btn-pizza">
                {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
