import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pizza, UserPlus, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react'
import { registerSchema } from '../../utils/validators'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const Register = () => {
  const { register: registerUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password
      })
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data || 'Registration failed'
      toast.error(typeof msg === 'string' ? msg : 'Please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, var(--sp-sienna) 0%, #7c2d12 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <Pizza size={52} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            SmartPizza
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: 320, lineHeight: 1.6 }}>
            Join thousands of pizza lovers. Order smart, eat better.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {['🍕', '🤖', '🚀'].map((e, i) => (
              <span key={i} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem'
              }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--sp-bg)',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div className="accent-line" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.95rem' }}>
              Join SmartPizza today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-group-text"><User size={16} /></span>
                <input type="text" {...register('name')} className="form-control" placeholder="John Doe" />
              </div>
              {errors.name && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><Mail size={16} /></span>
                <input type="email" {...register('email')} className="form-control" placeholder="you@example.com" />
              </div>
              {errors.email && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Mobile</label>
              <div className="input-group">
                <span className="input-group-text"><Phone size={16} /></span>
                <input type="text" {...register('mobile')} className="form-control" placeholder="9876543210" />
              </div>
              {errors.mobile && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.mobile.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><Lock size={16} /></span>
                  <input type="password" {...register('password')} className="form-control" placeholder="Min 6 chars" />
                </div>
                {errors.password && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.password.message}</p>}
              </div>
              <div>
                <label className="form-label">Confirm</label>
                <div className="input-group">
                  <span className="input-group-text"><Lock size={16} /></span>
                  <input type="password" {...register('confirmPassword')} className="form-control" placeholder="Re-enter" />
                </div>
                {errors.confirmPassword && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-pizza btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              <UserPlus size={18} />
              {submitting ? 'Creating...' : 'Create Account'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--sp-border)'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--sp-text-muted)', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--sp-sienna)', fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
