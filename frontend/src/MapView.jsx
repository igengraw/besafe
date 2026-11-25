import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { label } from './labels'
import { CENTER, TILE_URL, TILE_OPTIONS, DOT_STYLE } from './mapConfig'

export default function MapView({ reports }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  // Create the map once
  useEffect(() => {
    const map = L.map(containerRef.current).setView(CENTER, 11)
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Redraw dots whenever the reports change
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()

    reports.forEach((r) => {
      L.circleMarker([r.lat, r.lng], DOT_STYLE)
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
