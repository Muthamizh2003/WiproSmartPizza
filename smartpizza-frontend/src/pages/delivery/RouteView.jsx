import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bike, Navigation, RefreshCw } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { deliveryService } from '../../services/deliveryService'

const SHOP_LOCATION = { lat: 13.0827, lng: 80.2707 }

export const RouteView = () => {
  const [deliveries, setDeliveries] = useState([])
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  const load = async () => {
    try {
      const data = await deliveryService.getAgentOrders()
      const arr = Array.isArray(data) ? data : []
      setDeliveries(arr)
      const active = arr.find(d => d.status !== 'DELIVERED')
      setActiveDelivery(active || null)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id) }, [])

  useEffect(() => {
    if (!activeDelivery || mapRef.current) return
    const map = L.map('route-map', { zoomControl: true }).setView([activeDelivery.latitude, activeDelivery.longitude], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [activeDelivery])

  useEffect(() => {
    if (!mapRef.current) return
    markersRef.current.forEach(m => mapRef.current.removeLayer(m))
    markersRef.current = []

    const shopIcon = L.divIcon({ html: '<div style="background:#dc3545;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid #fff">S</div>', className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
    L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], { icon: shopIcon }).addTo(mapRef.current).bindPopup('<b>SmartPizza Shop</b>')

    deliveries.forEach(d => {
      const isActive = d.id === activeDelivery?.id
      const color = d.status === 'DELIVERED' ? '#198754' : isActive ? '#ffc107' : '#0d6efd'
      const icon = L.divIcon({
        html: `<div style="background:${color};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff">${d.orderId}</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14]
      })
      const marker = L.marker([d.latitude, d.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`<b>Order #${d.orderId}</b><br/>Status: ${d.status}<br/>Agent: ${d.agentName}`)
      markersRef.current.push(marker)

      if (d.status !== 'DELIVERED' && (activeDelivery?.id === d.id || !activeDelivery)) {
        mapRef.current.setView([d.latitude, d.longitude], 12)
      }
    })
  }, [deliveries, activeDelivery])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--sp-border)', borderTopColor: 'var(--sp-sienna)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={28} style={{ color: 'var(--sp-sienna)' }} /> Route View
          </h1>
        </div>
        <button onClick={load} className="btn btn-outline-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {deliveries.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <MapPin size={48} style={{ color: 'var(--sp-warm-gray)', margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontFamily: 'var(--font-display)' }}>No Active Routes</h4>
          <p style={{ color: 'var(--sp-text-muted)', marginBottom: '1rem' }}>No orders assigned yet.</p>
          <Link to="/delivery" className="btn btn-pizza">Back to Dashboard</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem', alignSelf: 'start' }}>
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bike size={18} style={{ color: 'var(--sp-sienna)' }} /> My Deliveries
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {deliveries.map(d => (
                <div key={d.orderId} style={{
                  padding: '0.65rem', borderRadius: 'var(--radius-sm)',
                  border: d.id === activeDelivery?.id ? '1px solid var(--sp-amber)' : '1px solid var(--sp-border)',
                  background: d.id === activeDelivery?.id ? 'var(--sp-amber-light)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Order #{d.orderId}</span>
                    <span style={{
                      padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)',
                      fontSize: '0.68rem', fontWeight: 600,
                      background: d.status === 'DELIVERED' ? 'var(--sp-sage)' : 'var(--sp-amber)',
                      color: '#fff'
                    }}>{d.status}</span>
                  </div>
                  <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>{d.agentName}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div id="route-map" style={{ width: '100%', height: 500 }} />
          </div>
        </div>
      )}
    </div>
  )
}
