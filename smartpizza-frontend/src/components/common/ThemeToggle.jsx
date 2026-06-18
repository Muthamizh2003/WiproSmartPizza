import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const ThemeToggle = () => {
  const { isDark, toggle } = useTheme()

  return (
    <button onClick={toggle}
      aria-label="Toggle theme"
      style={{
        width: 38, height: 38, borderRadius: '50%',
        border: '2px solid var(--sp-border)',
        background: 'var(--sp-bg-card)',
        color: 'var(--sp-text)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--sp-sienna)'
        e.currentTarget.style.color = 'var(--sp-sienna)'
        e.currentTarget.style.transform = 'scale(1.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--sp-border)'
        e.currentTarget.style.color = 'var(--sp-text)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <span style={{
        transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
        display: 'flex'
      }}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  )
}
