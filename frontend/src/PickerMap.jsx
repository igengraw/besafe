import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CENTER, TILE_URL, TILE_OPTIONS } from './mapConfig'

// Click the map to place a pin, then drag it to adjust.
// onChange receives { lat, lng } and must be a stable function (e.g. a setState).
export default function PickerMap({ onChange }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const map = L.map(containerRef.current).setView(CENTER, 12)
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(map)

    const icon = L.divIcon({
      className: 'pin',
      html: '<span></span>',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })
    let marker = null

    function place(latlng) {
      if (!marker) {
        marker = L.marker(latlng, { icon, draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          onChange({ lat: p.lat, lng: p.lng })
        })
      } else {
        marker.setLatLng(latlng)
      }
      onChange({ lat: latlng.lat, lng: latlng.lng })
    }

    map.on('click', (e) => place(e.latlng))
    return () => map.remove()
  }, [onChange])

  return <div ref={containerRef} className="map picker" />
}
