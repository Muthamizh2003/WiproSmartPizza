import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pizza, LogIn, Mail, Lock, ArrowRight } from 'lucide-react'
import { loginSchema } from '../../utils/validators'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const Login = () => {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await login(data)
      toast.success('Login successful!')
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      const msg = err.response?.data || 'Invalid credentials'
      toast.error(typeof msg === 'string' ? msg : 'Login failed')
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
            Your AI-powered pizza experience. Crafted with love, delivered with care.
          </p>
          <div style={{
            display: 'flex', gap: '0.5rem', justifyContent: 'center',
            marginTop: '2rem'
          }}>
            {['🍕', '🔥', '✨'].map((e, i) => (
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
        background: 'var(--sp-bg)'
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="accent-line" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.95rem' }}>
              Sign in to your SmartPizza account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label className="form-label">Email / Username</label>
              <div className="input-group">
                <span className="input-group-text"><Mail size={16} /></span>
                <input type="text" {...register('username')} className="form-control" placeholder="you@example.com" />
              </div>
              {errors.username && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.username.message}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><Lock size={16} /></span>
                <input type="password" {...register('password')} className="form-control" placeholder="Enter your password" />
              </div>
              {errors.password && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.password.message}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--sp-sienna)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-pizza btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              <LogIn size={18} />
              {submitting ? 'Signing in...' : 'Sign In'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--sp-border)'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--sp-text-muted)', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--sp-sienna)', fontWeight: 600 }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
