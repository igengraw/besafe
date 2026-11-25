import { useEffect, useState } from 'react'
import { getStats } from './api/stats'
import StatsSummary from './StatsSummary'
import BarList from './BarList'

const RANGES = [
  { id: 'all', label: 'All time', days: null },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: '365', label: 'Last year', days: 365 },
]

function rangeToFilter(id) {
  const range = RANGES.find((r) => r.id === id)
  if (!range?.days) return { from: null, to: null }

  const from = new Date()
  from.setDate(from.getDate() - range.days)
  return { from: from.toISOString().slice(0, 10), to: null }
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
      .catch((e) => {
        if (active) setError(e.message)
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

  return (
    <section>
      <h2>Statistics</h2>
      <p className="hint">
        Counts use approved reports only. Locations are approximate: the map position is
        shifted by 100-300 m before saving, and no personal data is stored.
      </p>

      <div className="range" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={r.id === range}
            onClick={() => changeRange(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && <p className="error">Could not load statistics: {error}</p>}
      {loading && !stats && <p>Loading...</p>}

      {stats && (
        <>
          <StatsSummary stats={stats} />

          {stats.source === 'client' && (
            <p className="hint">
              Temporary: counts are computed in the browser because the step 6 migration
              is not applied to the database yet.
            </p>
          )}

          {stats.total === 0 ? (
            <p className="hint">No approved reports in this period.</p>
          ) : (
            <>
              <BarList title="By category" items={stats.by_category} />
              <BarList title="By context" items={stats.by_context} />
              <BarList title="By time of day" items={stats.by_time_of_day} />
              <BarList title="By who" items={stats.by_who} />
            </>
          )}
        </>
      )}
    </section>
  )
}
