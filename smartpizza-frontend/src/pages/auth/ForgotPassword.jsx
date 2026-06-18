import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pizza, Mail, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'
import { forgotPasswordSchema } from '../../utils/validators'
import { useToast } from '../../context/ToastContext'

export const ForgotPassword = () => {
  const toast = useToast()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async () => {
    toast.info('Password reset is not available yet. Please contact support.')
    setSent(true)
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
            Don't worry, we'll help you get back in.
          </p>
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
              Forgot Password?
            </h2>
            <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.95rem' }}>
              Enter your email and we'll help you reset.
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--sp-sage-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <CheckCircle size={40} style={{ color: 'var(--sp-sage)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                Check Your Email
              </h3>
              <p style={{ color: 'var(--sp-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Password reset is not yet available via API. Contact support for assistance.
              </p>
              <Link to="/login" className="btn btn-pizza" style={{ gap: '0.5rem' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><Mail size={16} /></span>
                  <input type="email" {...register('email')} className="form-control" placeholder="you@example.com" />
                </div>
                {errors.email && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn btn-pizza btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                <Mail size={18} />
                Send Reset Link
                <ArrowRight size={16} />
              </button>

              <Link to="/login" style={{
                textAlign: 'center', fontSize: '0.9rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                marginTop: '0.5rem'
              }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
