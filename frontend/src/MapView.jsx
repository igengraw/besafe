import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { label } from './labels'

// One color per category. Change them here.
const COLORS = {
  harassment: '#e11d48',
  stalking: '#7c3aed',
  threat: '#ea580c',
  physical: '#b91c1c',
  emotional: '#0891b2',
  drink_spiking: '#ca8a04',
  sexual_violence: '#9f1239',
  unsafe: '#2563eb',
  other: '#64748b',
}

const ALMATY = [43.238, 76.945]

export default function MapView({ reports }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  // Create the map once
  useEffect(() => {
    const map = L.map(containerRef.current).setView(ALMATY, 11)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Redraw markers whenever the reports change
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()

    reports.forEach((r) => {
      L.circleMarker([r.lat, r.lng], {
        radius: 9,
        color: '#ffffff',
        weight: 2,
        fillColor: COLORS[r.category] || COLORS.other,
        fillOpacity: 0.85,
      })
        // Only fixed codes and a date are shown here. If free text is ever
        // added to the popup, it must be escaped first.
        .bindPopup(
          `<strong>${label(r.category)}</strong><br>` +
            `${label(r.context)} · ${label(r.time_of_day)}<br>` +
            `${r.incident_date}`
        )
        .addTo(layer)
    })
  }, [reports])

  return <div ref={containerRef} className="map" />
}
