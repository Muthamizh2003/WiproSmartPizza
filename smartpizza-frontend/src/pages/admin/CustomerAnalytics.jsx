import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, TrendingUp, Shield, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { StatsSkeleton, TableSkeleton } from '../../components/common/LoadingSkeleton'

const PIE_COLORS = ['#c97d60', '#7f9e7f', '#d4a574', '#5c5c5c', '#e8c170']

export const CustomerAnalytics = () => {
  const [topCustomers, setTopCustomers] = useState([])
  const [trends, setTrends] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      adminService.getCustomerAnalytics().catch(() => null),
      adminService.getCustomerTrends().catch(() => []),
      adminService.getAllUsers().catch(() => [])
    ]).then(([analytics, customerTrends, users]) => {
      const raw = analytics?.topCustomers || []
      const mapped = Array.isArray(raw) ? raw.map(row => {
        if (Array.isArray(row)) {
          return { id: row[0], name: row[1], email: row[2], orderCount: row[3], totalSpent: row[4] }
        }
        return row
      }) : []
      setTopCustomers(mapped)
      setTrends(Array.isArray(customerTrends) ? customerTrends : [])
      setAllUsers(Array.isArray(users) ? users : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleBlock = async (userId) => {
    try {
      await adminService.blockUser(userId)
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u))
    } catch { return null }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await adminService.deleteUser(userId)
      setAllUsers(prev => prev.filter(u => u.id !== userId))
    } catch { return null }
  }

  if (loading) return <StatsSkeleton />

  const totalCustomers = allUsers.length || topCustomers.length
  const activeToday = trends.length > 0 ? trends[trends.length - 1]?.activeUsers || 0 : 0

  const roleData = allUsers.reduce((acc, u) => {
    const roles = u.roles || []
    roles.forEach(r => { acc[r] = (acc[r] || 0) + 1 })
    if (roles.length === 0) acc['USER'] = (acc['USER'] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(roleData).map(([name, value]) => ({ name: name.replace('ROLE_', ''), value }))

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'All Users' },
    { key: 'top', label: 'Top Customers' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={28} style={{ color: 'var(--sp-sienna)' }} /> Customer Analytics
        </h1>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <div className="card"><div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--sp-sienna-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} style={{ color: 'var(--sp-sienna)' }} />
            </div>
            <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Total Customers</small>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{totalCustomers}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--sp-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={17} style={{ color: 'var(--sp-sage)' }} />
            </div>
            <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Active Today</small>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{activeToday}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#8b5cf615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={17} style={{ color: '#8b5cf6' }} />
            </div>
            <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Top Spenders</small>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{topCustomers.length}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#f59e0b15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={17} style={{ color: '#f59e0b' }} />
            </div>
            <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Admin Users</small>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{roleData['ROLE_ADMIN'] || 0}</p>
        </div></div>
      </div>

      {/* Customer Trends Line Chart */}
      {trends.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--sp-sienna)' }} /> Customer Activity Trends
            </h5>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sp-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--sp-text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--sp-text-muted)', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="activeUsers" stroke="var(--sp-sienna)" strokeWidth={2} dot={{ fill: 'var(--sp-sienna)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Role Distribution Pie Chart + Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
        {pieData.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem' }}>Role Distribution</h5>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`btn btn-sm ${tab === t.key ? 'btn-pizza' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.78rem' }}>{t.label}</button>
              ))}
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
              <div>
                <h6 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.88rem' }}>Recent Customers</h6>
                {topCustomers.slice(0, 5).map((c, i) => (
                  <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--sp-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--sp-sienna-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--sp-sienna)' }}>
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.82rem' }}>{c.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sp-text-muted)' }}>{c.email}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--sp-sage)' }}>{formatCurrency(c.totalSpent ?? 0)}</span>
                  </div>
                ))}
                {topCustomers.length === 0 && <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem' }}>No customer data yet</p>}
              </div>
            )}

            {/* All Users Tab */}
            {tab === 'users' && (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {allUsers.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--sp-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.blocked ? '#dc354515' : 'var(--sp-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.blocked ? <UserX size={14} style={{ color: '#dc3545' }} /> : <UserCheck size={14} style={{ color: 'var(--sp-sage)' }} />}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.82rem' }}>{u.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sp-text-muted)' }}>{u.email} &middot; {(u.roles || []).map(r => r.replace('ROLE_', '')).join(', ') || 'USER'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => handleBlock(u.id)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} title={u.blocked ? 'Unblock' : 'Block'}>
                        <Shield size={11} style={{ color: u.blocked ? 'var(--sp-sage)' : '#f59e0b' }} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} title="Delete">
                        <Trash2 size={11} style={{ color: '#dc3545' }} />
                      </button>
                    </div>
                  </div>
                ))}
                {allUsers.length === 0 && <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem' }}>No users found</p>}
              </div>
            )}

            {/* Top Customers Tab */}
            {tab === 'top' && (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {topCustomers.map((c, i) => (
                  <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--sp-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sp-sienna)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 }}>{i + 1}</span>
                      <div>
                        <strong style={{ fontSize: '0.82rem' }}>{c.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sp-text-muted)' }}>{c.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sp-sage)' }}>{formatCurrency(c.totalSpent ?? 0)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sp-text-muted)' }}>{c.orderCount ?? 0} orders</div>
                    </div>
                  </div>
                ))}
                {topCustomers.length === 0 && <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem' }}>No top customer data</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
