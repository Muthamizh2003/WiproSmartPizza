import { useState, useEffect } from 'react'
import { ClipboardList, Check, X, RefreshCw, Loader2, Truck, Filter, ChevronDown, Package } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TableSkeleton } from '../../components/common/LoadingSkeleton'
import { useToast } from '../../context/ToastContext'

const PIE_COLORS = ['#d4a574', '#7f9e7f', '#c97d60', '#f59e0b', '#5c5c5c', '#dc3545']

export const OrderManagement = () => {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [selectedAgentIds, setSelectedAgentIds] = useState({})

  const loadOrders = async () => {
    try {
      const data = await adminService.getAllOrders()
      setOrders(data || [])
    } catch { toast.error('Failed to load orders') }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      loadOrders(),
      adminService.getDeliveryAgents().catch(() => [])
    ]).then(([, agentData]) => {
      setAgents(Array.isArray(agentData) ? agentData : [])
    }).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await adminService.updateOrderStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success(`Order #${orderId} updated to ${status.replace(/_/g, ' ')}`)
    } catch { toast.error(`Failed to update order #${orderId}`) }
    finally { setUpdating(null) }
  }

  const assignAgent = async (orderId, agentId) => {
    if (!agentId) { toast.error('Please select a delivery agent'); return }
    setAssigning(orderId)
    try {
      await adminService.assignAgentToOrder(orderId, agentId)
      const data = await adminService.getAllOrders()
      setOrders(data || [])
      setSelectedAgentIds(prev => ({ ...prev, [orderId]: undefined }))
      toast.success(`Agent assigned to order #${orderId}`)
    } catch { toast.error(`Failed to assign agent to order #${orderId}`) }
    finally { setAssigning(null) }
  }

  if (loading) return <TableSkeleton />

  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const completedOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status))
  const filteredOrders = filter === 'all' ? orders : filter === 'active' ? activeOrders : completedOrders

  // Pie chart data
  const statusCounts = {}
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1 })
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))

  const statusColors = {
    PLACED: 'var(--sp-amber)',
    PENDING_PAYMENT: '#f59e0b',
    CONFIRMED: 'var(--sp-sage)',
    PREPARING: 'var(--sp-sienna)',
    OUT_FOR_DELIVERY: '#f59e0b',
    DELIVERED: 'var(--sp-sage)',
    CANCELLED: '#dc3545'
  }

  const statusFlow = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']

  const getNextStatus = (current) => {
    const idx = statusFlow.indexOf(current)
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={28} style={{ color: 'var(--sp-sienna)' }} /> Order Management
        </h1>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
        {[
          { label: 'Total Orders', value: orders.length, color: 'var(--sp-sienna)' },
          { label: 'Active', value: activeOrders.length, color: '#f59e0b' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: 'var(--sp-sage)' },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'CANCELLED').length, color: '#dc3545' }
        ].map(s => (
          <div key={s.label} className="card"><div className="card-body" style={{ padding: '0.85rem' }}>
            <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.75rem' }}>{s.label}</small>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.15rem 0 0', color: s.color }}>{s.value}</p>
          </div></div>
        ))}
      </div>

      {/* Charts + Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.75rem' }}>Order Status Distribution</h5>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Delivery Agents */}
        <div className="card">
          <div className="card-body">
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Truck size={16} style={{ color: 'var(--sp-sienna)' }} /> Delivery Agents
            </h5>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {agents.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--sp-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: a.available ? 'var(--sp-sage-light)' : '#dc354515', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={12} style={{ color: a.available ? 'var(--sp-sage)' : '#dc3545' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.8rem' }}>{a.name}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--sp-text-muted)' }}>{a.phone || 'No phone'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-full)', background: a.available ? 'var(--sp-sage)' : '#dc3545', color: '#fff', fontWeight: 600 }}>
                    {a.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              ))}
              {agents.length === 0 && <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.8rem' }}>No agents found</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'all', label: `All (${orders.length})` },
          { key: 'active', label: `Active (${activeOrders.length})` },
          { key: 'completed', label: `Completed (${completedOrders.length})` }
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? 'btn-pizza' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={12} /> {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredOrders.length > 0 ? filteredOrders.map(order => {
          const isExpanded = expandedId === order.id
          const nextStatus = getNextStatus(order.status)
          const canAssign = ['CONFIRMED', 'PREPARING'].includes(order.status) && !order.deliveryAgentName

          return (
            <div key={order.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>#{order.id}</strong>
                  <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem', fontWeight: 600,
                    background: `${statusColors[order.status] || 'var(--sp-warm-gray)'}18`,
                    color: statusColors[order.status] || 'var(--sp-text-muted)'
                  }}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                  {order.deliveryAgentName && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--sp-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Truck size={11} /> {order.deliveryAgentName}
                    </span>
                  )}
                  {order.deliveryStatus && (
                    <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-full)', background: '#f59e0b18', color: '#f59e0b', fontWeight: 500 }}>
                      Delivery: {order.deliveryStatus?.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--sp-sage)', fontSize: '0.95rem' }}>{formatCurrency(order.totalAmount)}</span>
                  <button onClick={() => setExpandedId(isExpanded ? null : order.id)} className="btn btn-sm btn-outline-secondary" style={{ padding: '0.25rem 0.4rem' }}>
                    <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--sp-text-muted)', marginTop: '0.35rem' }}>
                {order.userName} &middot; {formatDate(order.createdAt)}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--sp-border)' }}>
                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                        <Package size={13} /> Order Items
                      </strong>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--sp-warm-gray-light)', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                          <span>{item.productName} x {item.quantity}</span>
                          <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {/* Status Update Buttons */}
                    {order.status === 'PLACED' && (
                      <button onClick={() => updateStatus(order.id, 'CONFIRMED')} disabled={updating === order.id} className="btn btn-sm btn-pizza" style={{ fontSize: '0.75rem' }}>
                        {updating === order.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />} Confirm
                      </button>
                    )}
                    {nextStatus && order.status !== 'PLACED' && (
                      <button onClick={() => updateStatus(order.id, nextStatus)} disabled={updating === order.id} className="btn btn-sm btn-pizza" style={{ fontSize: '0.75rem' }}>
                        {updating === order.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />} Mark as {nextStatus.replace(/_/g, ' ').toLowerCase()}
                      </button>
                    )}
                    {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')} disabled={updating === order.id} className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem', color: '#dc3545' }}>
                        <X size={12} /> Cancel
                      </button>
                    )}

                    {/* Assign Delivery Agent */}
                    {canAssign && (
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <select
                          value={selectedAgentIds[order.id] || ''}
                          onChange={(e) => setSelectedAgentIds(prev => ({ ...prev, [order.id]: e.target.value ? Number(e.target.value) : undefined }))}
                          style={{
                            fontSize: '0.72rem', padding: '0.2rem 0.3rem',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--sp-border)',
                            background: 'var(--sp-warm-gray-light)', maxWidth: '130px'
                          }}
                        >
                          <option value="">Select agent...</option>
                          {agents.filter(a => a.available).map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignAgent(order.id, selectedAgentIds[order.id])}
                          disabled={assigning === order.id || !selectedAgentIds[order.id]}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          {assigning === order.id ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <Truck size={10} />} Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        }) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--sp-text-muted)' }}>No orders found</div>
        )}
      </div>
    </div>
  )
}
