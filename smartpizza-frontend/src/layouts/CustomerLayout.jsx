import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Pizza, History, Home, Edit3, Save, X, Mail, Phone, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import { useToast } from '../context/ToastContext'
import { ThemeToggle } from '../components/common/ThemeToggle'

export const CustomerLayout = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '' })
  const [isNavCollapsed, setIsNavCollapsed] = useState(true)
  
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openEditProfile = async () => {
    if (!user?.id) return
    try {
      const data = await userService.getById(user.id)
      setForm({ name: data.name || '', email: data.email || '', mobile: data.mobile || '' })
      setShowModal(true)
    } catch {
      toast.error('Failed to load profile')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setForm({ name: '', email: '', mobile: '' }) // Reset form state
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const updated = await userService.update(user.id, form)
      updateUser({ name: updated.name, email: updated.email })
      toast.success('Profile updated')
      handleCloseModal() // Close modal and reset form on success
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { 
    logout()
    navigate('/login') 
  }

  const isFormValid = form.name.trim() !== '' && form.email.trim() !== '' && form.mobile.trim() !== ''

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: 'var(--font-body)' }}>
      <nav 
        className="navbar navbar-expand-lg sticky-top" 
        style={{ 
          backgroundColor: 'var(--sp-bg-card)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--sp-border)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--sp-sienna)', fontSize: '1.5rem' }}>
            <Pizza size={28} /> SmartPizza
          </Link>
          
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navMenu" style={{ transition: 'height 0.3s ease' }}>
            <ul className="navbar-nav me-auto gap-2 my-2 my-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1" style={{ transition: 'all 0.2s' }}>
                  <Home size={16} /> Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/menu" className="nav-link btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1" style={{ transition: 'all 0.2s' }}>
                  <Pizza size={16} /> Menu
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/suggestions" className="nav-link btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1" style={{ transition: 'all 0.2s' }}>
                  <Sparkles size={16} /> Suggestions
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/orders" className="nav-link btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1" style={{ transition: 'all 0.2s' }}>
                  <History size={16} /> Orders
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center gap-3">
              <ThemeToggle />
              
              <Link to="/cart" className="btn btn-outline-pizza btn-sm rounded-pill px-3 d-flex align-items-center gap-2">
                <ShoppingCart size={18} />
                <span className="d-none d-lg-inline">Cart</span>
              </Link>
              
              <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 dropdown-toggle d-flex align-items-center gap-2"
                >
                  <User size={16} /> <span className="d-none d-sm-inline">{user?.name || user?.username || 'Account'}</span>
                </button>
                
                {showDropdown && (
                  <ul 
                    className="dropdown-menu dropdown-menu-end show shadow-sm" 
                    style={{ 
                      position: 'absolute', 
                      right: 0, 
                      top: 'calc(100% + 0.5rem)', 
                      zIndex: 1050,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--sp-border)',
                      animation: 'fadeIn 0.2s ease'
                    }}
                  >
                    <li>
                      <Link to="/profile" className="dropdown-item py-2 d-flex align-items-center gap-2" onClick={() => setShowDropdown(false)}>
                        <User size={16} /> View Profile
                      </Link>
                    </li>
                    <li>
                      <button onClick={() => { openEditProfile(); setShowDropdown(false) }} className="dropdown-item py-2 d-flex align-items-center gap-2">
                        <Edit3 size={16} /> Edit Profile
                      </button>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button onClick={() => { handleLogout(); setShowDropdown(false) }} className="dropdown-item py-2 text-danger d-flex align-items-center gap-2">
                        <LogOut size={16} /> Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <User size={24} className="text-pizza" /> Edit Profile
                </h5>
                <button onClick={handleCloseModal} className="btn-close" aria-label="Close" />
              </div>
              <div className="modal-body d-flex flex-column gap-4 pt-4">
                <div>
                  <label className="form-label fw-medium small text-muted mb-1">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><User size={18} className="text-muted" /></span>
                    <input type="text" className="form-control border-start-0 ps-0" value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter your name" />
                  </div>
                </div>
                <div>
                  <label className="form-label fw-medium small text-muted mb-1">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted" /></span>
                    <input type="email" className="form-control border-start-0 ps-0" value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})} placeholder="Enter your email" />
                  </div>
                </div>
                <div>
                  <label className="form-label fw-medium small text-muted mb-1">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Phone size={18} className="text-muted" /></span>
                    <input type="text" className="form-control border-start-0 ps-0" value={form.mobile}
                      onChange={e => setForm({...form, mobile: e.target.value})} placeholder="Enter your mobile number" />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                <button onClick={handleCloseModal} className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button onClick={handleSaveProfile} disabled={saving || !isFormValid} className="btn btn-pizza rounded-pill px-4 d-flex align-items-center gap-2">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-grow-1" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      
      <footer style={{ backgroundColor: '#fdfbf7', borderTop: '4px solid var(--sp-sienna)' }} className="py-4 mt-auto">
        <div className="container text-center">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            <Pizza size={20} style={{ color: 'var(--sp-sienna)' }} />
            <span className="fw-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--sp-sienna)', fontSize: '1.2rem' }}>SmartPizza</span>
          </div>
          <div className="text-muted small">
            &copy; {new Date().getFullYear()} SmartPizza AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
