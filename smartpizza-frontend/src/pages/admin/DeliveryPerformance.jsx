import { useState, useEffect } from 'react'
import { Truck, CheckCircle, Clock, TrendingUp, Users, Phone, MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminService } from '../../services/adminService'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'

const PIE_COLORS = ['#7f9e7f', '#f59e0b', '#c97d60', '#dc3545', '#5c5c5c', '#8b5cf6']

export const DeliveryPerformance = () => {
  const [delivery, setDelivery] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getDeliveryAnalytics().catch(() => null),
      adminService.getDeliveryAgents().catch(() => [])
    ]).then(([del, agentData]) => {
      setDelivery(del)
      setAgents(Array.isArray(agentData) ? agentData : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <StatsSkeleton />

  const deliveryStats = delivery?.deliveryStats || []
  const statusMap = {}
  deliveryStats.forEach(([status, count]) => { statusMap[status] = count })

  const totalDelivered = statusMap['DELIVERED'] || 0
  const inTransit = statusMap['OUT_FOR_DELIVERY'] || 0
  const totalOrders = Object.values(statusMap).reduce((sum, c) => sum + (typeof c === 'number' ? c : 0), 0)
  const onTimeRate = totalOrders > 0 ? ((totalDelivered / totalOrders) * 100).toFixed(1) : '0.0'
  const availableAgents = agents.filter(a => a.available).length

  // Bar chart data
  const barData = Object.entries(statusMap).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    count
  }))

  // Pie chart data
  const pieData = Object.entries(statusMap).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={28} style={{ color: 'var(--sp-sienna)' }} /> Delivery Performance
        </h1>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#8b5cf615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={17} style={{ color: '#8b5cf6' }} />
              </div>
              <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Total Orders</small>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{totalOrders}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--sp-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={17} style={{ color: 'var(--sp-sage)' }} />
              </div>
              <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Total Delivered</small>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{totalDelivered}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: '#f59e0b15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={17} style={{ color: '#f59e0b' }} />
              </div>
              <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>In Transit</small>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{inTransit}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--sp-sienna-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={17} style={{ color: 'var(--sp-sienna)' }} />
              </div>
              <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>Delivery Rate</small>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{onTimeRate}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Bar Chart */}
        <div className="card">
          <div className="card-body">
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.75rem' }}>Status Breakdown</h5>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sp-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--sp-text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--sp-text-muted)', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--sp-sienna)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No delivery data</p>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-body">
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.75rem' }}>Distribution</h5>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Agents List */}
      <div className="card">
        <div className="card-body">
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--sp-sienna)' }} /> Delivery Agents
            <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--sp-text-muted)', marginLeft: '0.5rem' }}>
              {availableAgents} of {agents.length} available
            </span>
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {agents.map(a => (
              <div key={a.id} className="card" style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.available ? 'var(--sp-sage-light)' : '#dc354515', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={15} style={{ color: a.available ? 'var(--sp-sage)' : '#dc3545' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.88rem' }}>{a.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sp-text-muted)' }}>ID: {a.id}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)',
                    background: a.available ? 'var(--sp-sage)' : '#dc3545', color: '#fff', fontWeight: 600
                  }}>
                    {a.available ? 'Available' : 'Busy'}
                  </span>
                </div>
                {a.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--sp-text-muted)', marginTop: '0.35rem' }}>
                    <Phone size={12} /> {a.phone}
                  </div>
                )}
              </div>
            ))}
            {agents.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', color: 'var(--sp-text-muted)' }}>
                No delivery agents found. Add agents from Admin Dashboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
