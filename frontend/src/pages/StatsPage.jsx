import { useEffect, useState } from 'react'
import { getStats } from '../api/stats'
import { label } from '../labels'

const RANGES = [
  { id: 'all', label: 'All time', days: null },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: '365', label: 'Last year', days: 365 },
]

function rangeToFilter(id) {
  const range = RANGES.find((item) => item.id === id)
  if (!range?.days) return { from: null, to: null }

  const from = new Date()
  from.setDate(from.getDate() - range.days)
  return { from: from.toISOString().slice(0, 10), to: null }
}

function BarGroup({ title, items }) {
  const safeItems = items ?? []
  const max = Math.max(0, ...safeItems.map((item) => item.count))

  return (
    <section className="stat-block">
      <h2>{title}</h2>
      {safeItems.length === 0 ? (
        <p className="hint">No data yet</p>
      ) : (
        safeItems.map((item) => (
          <div className="bar-row" key={item.code}>
            <span>{label(item.code)}</span>
            <span className="bar-track" aria-hidden="true">
              <span
                className="bar-fill"
                style={{
                  width: `${max ? Math.max(3, (item.count / max) * 100) : 0}%`,
                }}
              />
            </span>
            <span className="bar-count">{item.count}</span>
          </div>
        ))
      )}
    </section>
  )
}

export default function StatsPage() {
  const [range, setRange] = useState('all')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getStats(rangeToFilter(range))
      .then((data) => {
        if (active) setStats(data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unknown error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [range])

  function changeRange(id) {
    if (id === range) return
    setRange(id)
    setLoading(true)
    setError('')
  }

  const topCategory = stats?.by_category?.[0]
  const groups = stats
    ? [
        { title: 'By category', items: stats.by_category },
        { title: 'By context', items: stats.by_context },
        { title: 'By time of day', items: stats.by_time_of_day },
        { title: 'By who was involved', items: stats.by_who },
      ]
    : []

  return (
    <section className="shell stats-page">
      <p className="eyebrow">BE SAFE ALMATY</p>
      <h1>Statistics</h1>
      <p className="page-lead">
        An overview of approved reports. These numbers describe submitted
        reports, not the total number of incidents in the city.
      </p>

      <div className="range" role="group" aria-label="Time range">
        {RANGES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === range}
            onClick={() => changeRange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="error">Could not load statistics: {error}</p>}
      {loading && <p className="hint">Loading statistics...</p>}

      {stats && (
        <>
          <div className="stat-tiles">
            <article className="stat-tile">
              <strong>{stats.total ?? 0}</strong>
              <span>Approved reports</span>
            </article>
            <article className="stat-tile">
              <strong>{stats.recent?.last_30_days ?? 0}</strong>
              <span>In the last 30 days</span>
            </article>
            <article className="stat-tile">
              <strong style={{ fontSize: 22 }}>
                {topCategory ? label(topCategory.code) : '—'}
              </strong>
              <span>Most reported category</span>
            </article>
            <article className="stat-tile">
              <strong style={{ fontSize: 22 }}>
                {stats.first_date || '—'}
              </strong>
              <span>First report date</span>
            </article>
          </div>

          {stats.source === 'client' && (
            <p className="hint">
              Statistics are currently calculated in the browser because
              the database statistics function is not available.
            </p>
          )}

          {stats.total === 0 ? (
            <p className="hint">No approved reports in this period.</p>
          ) : (
            groups.map((group) => (
              <BarGroup
                key={group.title}
                title={group.title}
                items={group.items}
              />
            ))
          )}
        </>
      )}
    </section>
  )
}
