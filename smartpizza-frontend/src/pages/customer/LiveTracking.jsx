import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Bike, Clock, MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { deliveryService } from '../../services/deliveryService'

const RIDER_ICON = L.divIcon({
  html: '<div style="background:#c2410c;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">🏍️</div>',
  className: '', iconSize: [36, 36], iconAnchor: [18, 18]
})

const CUSTOMER_ICON = L.divIcon({
  html: '<div style="background:#dc3545;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">📍</div>',
  className: '', iconSize: [36, 36], iconAnchor: [18, 36]
})

const SHOP_ICON = L.divIcon({
  html: '<div style="background:#4a7c59;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid #fff">🍕</div>',
  className: '', iconSize: [28, 28], iconAnchor: [14, 14]
})

export const LiveTracking = () => {
  const { orderId } = useParams()
  const mapRef = useRef(null)
  const riderMarkerRef = useRef(null)
  const customerMarkerRef = useRef(null)
  const routeLineRef = useRef(null)
  const [delivery, setDelivery] = useState(null)
  const [eta, setEta] = useState(null)
  const [error, setError] = useState(null)

  const fetchRoute = useCallback(async (fromLat, fromLng, toLat, toLng) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full`)
      const data = await res.json()
      if (data.code === 'Ok' && data.routes?.length) return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
    } catch {}
    return null
  }, [])

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const d = await deliveryService.track(orderId)
        setDelivery(d)
        try { const e = await deliveryService.getEta(orderId); setEta(e) } catch {}
      } catch { setError('Tracking not available yet. Order may not be out for delivery.') }
    }
    fetchTracking()
    const interval = setInterval(fetchTracking, 15000)
    return () => clearInterval(interval)
  }, [orderId])

  useEffect(() => {
    if (!delivery || mapRef.current) return
    const map = L.map('tracking-map', { zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map)
    L.marker([13.0827, 80.2707], { icon: SHOP_ICON }).addTo(map).bindPopup('<b>SmartPizza Shop</b>')
    riderMarkerRef.current = L.marker([delivery.latitude, delivery.longitude], { icon: RIDER_ICON }).addTo(map).bindPopup(`<b>${delivery.agentName}</b><br/>En route to you`)
    customerMarkerRef.current = L.marker([delivery.customerLatitude, delivery.customerLongitude], { icon: CUSTOMER_ICON }).addTo(map).bindPopup('<b>Your Location</b>')
    const bounds = L.latLngBounds(
      [Math.min(delivery.latitude, delivery.customerLatitude, 13.0827), Math.min(delivery.longitude, delivery.customerLongitude, 80.2707)],
      [Math.max(delivery.latitude, delivery.customerLatitude, 13.0827), Math.max(delivery.longitude, delivery.customerLongitude, 80.2707)]
    )
    map.fitBounds(bounds, { padding: [50, 50] })
    mapRef.current = map
    fetchRoute(delivery.latitude, delivery.longitude, delivery.customerLatitude, delivery.customerLongitude).then(coords => {
      if (coords && mapRef.current) routeLineRef.current = L.polyline(coords, { color: '#c2410c', weight: 4, opacity: 0.7 }).addTo(mapRef.current)
    })
    return () => { map.remove(); mapRef.current = null }
  }, [delivery, fetchRoute])

  useEffect(() => {
    if (!delivery || !mapRef.current || !riderMarkerRef.current) return
    riderMarkerRef.current.setLatLng([delivery.latitude, delivery.longitude])
    if (routeLineRef.current) mapRef.current.removeLayer(routeLineRef.current)
    fetchRoute(delivery.latitude, delivery.longitude, delivery.customerLatitude, delivery.customerLongitude).then(coords => {
      if (coords && mapRef.current) routeLineRef.current = L.polyline(coords, { color: '#c2410c', weight: 4, opacity: 0.7 }).addTo(mapRef.current)
    })
    const bounds = L.latLngBounds(
      [Math.min(delivery.latitude, delivery.customerLatitude), Math.min(delivery.longitude, delivery.customerLongitude)],
      [Math.max(delivery.latitude, delivery.customerLatitude), Math.max(delivery.longitude, delivery.customerLongitude)]
    )
    mapRef.current.fitBounds(bounds, { padding: [50, 50] })
  }, [delivery?.latitude, delivery?.longitude, delivery?.customerLatitude, delivery?.customerLongitude, fetchRoute])

  const statCards = [
    { icon: MapPin, label: 'Status', value: delivery?.status || 'In Transit', color: 'var(--sp-sienna)' },
    { icon: Bike, label: 'Delivery Agent', value: delivery?.agentName || 'Assigned', color: 'var(--sp-amber)' },
    { icon: Clock, label: 'Estimated Arrival', value: eta ? `${Math.round(eta)} min` : 'Calculating...', color: 'var(--sp-sage)' }
  ]

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <Bike size={64} style={{ color: 'var(--sp-text-muted)', margin: '0 auto 1.25rem', display: 'block' }} />
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Tracking Unavailable</h4>
      <p style={{ color: 'var(--sp-text-muted)' }}>{error}</p>
    </div>
  )

  if (!delivery) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner-border" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div className="accent-line" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bike size={28} style={{ color: 'var(--sp-sienna)' }} /> Live Tracking
        </h1>
        <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Order #{orderId}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        {statCards.map((s, i) => (
          <div key={i} className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <s.icon size={28} style={{ color: s.color, margin: '0 auto 0.5rem', display: 'block' }} />
              <small style={{ color: 'var(--sp-text-muted)', fontSize: '0.78rem' }}>{s.label}</small>
              <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0.2rem 0 0' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ height: 450 }}>
          <div id="tracking-map" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '1rem' }}>
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.15rem' }}>Your order is on the way!</h5>
          <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.8rem', margin: 0 }}>Auto-refreshing every 15 seconds</p>
        </div>
      </div>
    </div>
  )
}
