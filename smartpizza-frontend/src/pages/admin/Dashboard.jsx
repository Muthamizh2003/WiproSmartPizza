import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ClipboardList, Truck, Users, DollarSign, Bike, Calendar, RefreshCw, Pizza } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatters'
import { StatsSkeleton } from '../../components/common/LoadingSkeleton'
import { OrderHeatmap } from '../../components/admin/OrderHeatmap'

export const Dashboard = () => {
  const [revenue, setRevenue] = useState(null)
  const [orders, setOrders] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [dailyOrders, setDailyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const fetchAll = async () => {
    const [rev, ord, del, daily] = await Promise.all([
      adminService.getRevenue().catch(() => null),
      adminService.getOrderAnalytics().catch(() => null),
      adminService.getDeliveryAnalytics().catch(() => null),
      adminService.getDailyOrders().catch(() => [])
    ])
    if (rev) setRevenue(rev)
    if (ord) setOrders(ord)
    if (del) setDelivery(del)
    if (daily) setDailyOrders(daily)
  }

  useEffect(() => {
    setLoading(true)
    fetchAll().finally(() => setLoading(false))
    intervalRef.current = setInterval(fetchAll, 30000)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (loading) return <StatsSkeleton />

  const totalDailyOrders = dailyOrders.reduce((s, d) => s + (d.count || 0), 0)
  const avgDaily = dailyOrders.length > 0 ? Math.round(totalDailyOrders / dailyOrders.length) : 0
  const maxDay = dailyOrders.reduce((best, d) => (d.count > (best?.count || 0) ? d : best), dailyOrders[0])

  const statusMap = {}
  if (delivery?.deliveryStats) delivery.deliveryStats.forEach(([status, count]) => { statusMap[status] = count })
  const inTransit = statusMap['OUT_FOR_DELIVERY'] || 0
  const delivered = statusMap['DELIVERED'] || 0

  const stats = [
    { label: 'Total Revenue', value: revenue ? formatCurrency(revenue.totalRevenue || 0) : 'N/A', icon: DollarSign, color: 'var(--sp-sage)' },
    { label: 'Daily Revenue', value: revenue ? formatCurrency(revenue.dailyRevenue || 0) : 'N/A', icon: TrendingUp, color: 'var(--sp-sienna)' },
    { label: 'Total Orders', value: orders?.totalOrders ?? 'N/A', icon: ClipboardList, color: 'var(--sp-amber)' },
    { label: 'In Transit', value: inTransit, icon: Bike, color: '#f59e0b' },
    { label: 'Delivered', value: delivered, icon: Truck, color: 'var(--sp-sage)' }
  ]

  // Status counts for pie chart
  const statusCounts = orders?.statusCounts || []
  const statusData = statusCounts.map(([status, count]) => ({
    name: status?.replace(/_/g, ' '),
    count
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={28} style={{ color: 'var(--sp-sienna)' }} /> Dashboard
          </h1>
        </div>
        <button onClick={fetchAll} className="btn btn-outline-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={17} style={{ color: s.color }} />
                </div>
                <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>{s.label}</small>
              </div>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Orders Line Chart + Heatmap */}
      <div className="card">
        <div className="card-body">
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--sp-sienna)' }} /> Daily Order Activity
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { label: 'Total Orders (365d)', value: totalDailyOrders },
              { label: 'Avg Orders / Day', value: avgDaily },
              { label: 'Best Day', value: maxDay ? `${maxDay.date} (${maxDay.count})` : '—' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--sp-sienna-light)', textAlign: 'center' }}>
                <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem', display: 'block' }}>{item.label}</small>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--sp-sienna)' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Line Chart for Daily Orders */}
          {dailyOrders.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h6 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--sp-text-muted)' }}>Orders Over Time</h6>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sp-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--sp-text-muted)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--sp-text-muted)', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="var(--sp-sienna)" strokeWidth={2} dot={{ fill: 'var(--sp-sienna)', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <OrderHeatmap data={dailyOrders} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Order Status Bar Chart */}
        <div className="card">
          <div className="card-body">
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Order Status
            </h5>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sp-border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--sp-text-muted)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--sp-text-muted)', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--sp-sienna)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.75rem' }}>
                  {statusCounts.map(([status, count], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--sp-warm-gray-light)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{status?.replace(/_/g, ' ')}</span>
                      <span className="badge bg-secondary">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem' }}>No order data</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem' }}>Quick Links</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { to: '/admin/revenue', icon: TrendingUp, label: 'Revenue Analytics' },
                { to: '/admin/orders', icon: ClipboardList, label: 'Order Management' },
                { to: '/admin/menu', icon: Pizza, label: 'Menu Management' },
                { to: '/admin/customers', icon: Users, label: 'Customer Analytics' },
                { to: '/admin/delivery', icon: Truck, label: 'Delivery Performance' }
              ].map(l => (
                <Link key={l.to} to={l.to} className="btn btn-outline-secondary" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <l.icon size={16} /> {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
