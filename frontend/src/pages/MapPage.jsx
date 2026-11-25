import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getApprovedReports } from '../api/reports'
import { CENTER, TILE_URL, TILE_OPTIONS, DOT_STYLE, HEAT_STYLE, DISTRICT_STYLE } from '../mapConfig'
import { DISTRICTS, nearestDistrict } from '../data/districts'
import { CATEGORY_OPTIONS, TIME_OPTIONS } from '../options'
import { categoryLabel, label } from '../labels'

const PERIODS = [
  { id: '30d', label: '30 days', days: 30 },
  { id: '6m', label: '6 months', days: 182 },
  { id: '1y', label: '1 year', days: 365 },
]

const SHORT_TIME = { morning: 'Morning', afternoon: 'Day', evening: 'Evening', night: 'Night' }

function cutoffDate(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function peakOf(byTime) {
  return Object.entries(byTime).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

export default function MapPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(null)
  const [time, setTime] = useState(null)
  const [period, setPeriod] = useState('6m')
  const [heatmap, setHeatmap] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const reportLayerRef = useRef(null)
  const districtLayerRef = useRef(null)

  useEffect(() => {
    getApprovedReports()
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const days = PERIODS.find((p) => p.id === period)?.days ?? 365
    const cutoff = cutoffDate(days)
    return reports.filter((r) => {
      if (category && r.category !== category) return false
      if (time && r.time_of_day !== time) return false
      if (r.incident_date && r.incident_date < cutoff) return false
      return true
    })
  }, [reports, category, time, period])

  const districtStats = useMemo(() => {
    const stats = new Map(
      DISTRICTS.map((district) => [
        district.id,
        { district, total: 0, byTime: { morning: 0, afternoon: 0, evening: 0, night: 0 } },
      ])
    )

    for (const report of filtered) {
      const entry = stats.get(nearestDistrict(report.lat, report.lng).id)
      entry.total += 1
      if (report.time_of_day && entry.byTime[report.time_of_day] !== undefined) {
        entry.byTime[report.time_of_day] += 1
      }
    }

    return [...stats.values()].filter((entry) => entry.total > 0).sort((a, b) => b.total - a.total)
  }, [filtered])

  const selected = districtStats.find((entry) => entry.district.id === selectedId) ?? districtStats[0] ?? null
  const peak = selected ? peakOf(selected.byTime) : null
  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? ''

  useEffect(() => {
    const map = L.map(containerRef.current, { zoomControl: false }).setView(CENTER, 11)
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    reportLayerRef.current = L.layerGroup().addTo(map)
    districtLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      reportLayerRef.current = null
      districtLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    const layer = reportLayerRef.current
    if (!layer) return
    layer.clearLayers()

    for (const report of filtered) {
      const style = heatmap ? HEAT_STYLE : DOT_STYLE
      L.circleMarker([report.lat, report.lng], style)
        .bindPopup(
          `<strong>${categoryLabel(report.category)}</strong><br>` +
            `${label(report.time_of_day)} · ${report.incident_date ?? 'date not set'}`
        )
        .on('click', () => setSelectedId(nearestDistrict(report.lat, report.lng).id))
        .addTo(layer)
    }
  }, [filtered, heatmap])

  useEffect(() => {
    const layer = districtLayerRef.current
    if (!layer) return
    layer.clearLayers()
    if (!selected) return

    L.circle(selected.district.center, DISTRICT_STYLE).addTo(layer)
    L.marker(selected.district.center, {
      interactive: false,
      icon: L.divIcon({
        className: 'district-pin',
        html: `<span class="district-label">${selected.district.name}</span>`,
        iconSize: [0, 0],
      }),
    }).addTo(layer)
  }, [selected])

  function clearFilters() {
    setCategory(null)
    setTime(null)
    setPeriod('6m')
  }

  return (
    <div className="map-page">
      <aside className="map-sidebar">
        <h1>Filters</h1>

        <div className="filter-group">
          <p className="filter-label">Incident type</p>
          <div className="chip-row">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={category === option.value ? 'chip is-active' : 'chip'}
                aria-pressed={category === option.value}
                onClick={() => setCategory((current) => (current === option.value ? null : option.value))}
              >
                {categoryLabel(option.value)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <p className="filter-label">Time of day</p>
          <div className="chip-row">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={time === option.value ? 'chip is-active' : 'chip'}
                aria-pressed={time === option.value}
                onClick={() => setTime((current) => (current === option.value ? null : option.value))}
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <p className="filter-label">Period</p>
          <div className="chip-row">
            {PERIODS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={period === option.id ? 'chip is-active' : 'chip'}
                aria-pressed={period === option.id}
                onClick={() => setPeriod(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="switch-row">
            <span>Heatmap</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={heatmap}
                onChange={(event) => setHeatmap(event.target.checked)}
              />
              <span aria-hidden="true" />
            </span>
          </label>
        </div>
      </aside>

      <div className="map-canvas">
        <div ref={containerRef} className="leaflet-host" />

        {!loading && !error && selected && (
          <aside className="district-card">
            <h2>{selected.district.name}</h2>
            <p className="sub">
              {selected.district.note} · last {periodLabel}
            </p>

            <div className="district-metrics">
              <div className="metric">
                <strong>{selected.total}</strong>
                <span>reports</span>
              </div>
              <div className="metric">
                <strong>{peak ? SHORT_TIME[peak] : '—'}</strong>
                <span>peak time</span>
              </div>
            </div>

            <div className="time-bars">
              {TIME_OPTIONS.map((option) => {
                const count = selected.byTime[option.value] || 0
                const max = Math.max(1, ...Object.values(selected.byTime))
                return (
                  <div
                    key={option.value}
                    className={peak === option.value ? 'time-bar is-peak' : 'time-bar'}
                  >
                    <i style={{ height: `${10 + (count / max) * 46}px` }} />
                    <b>{SHORT_TIME[option.value]}</b>
                  </div>
                )
              })}
            </div>

            <a className="btn btn-primary btn-block" href={`#/report?area=${selected.district.id}`}>
              Report in this area
            </a>
          </aside>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="map-empty">
            <div className="map-empty-card">
              <div className="map-empty-icon" aria-hidden="true">
                ⌕
              </div>
              <h2>No reports match these filters</h2>
              <p>
                Try a wider period or another area. Fewer reports can also mean fewer people
                have used Besafe so far.
              </p>
              <div className="map-empty-actions">
                <button type="button" className="btn btn-primary" onClick={clearFilters}>
                  Clear filters
                </button>
                <a className="btn btn-secondary" href="#/report">
                  Report in this area
                </a>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
