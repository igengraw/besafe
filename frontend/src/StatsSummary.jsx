import { label } from './labels'

// Numbers at the top of the home and statistics pages.
export default function StatsSummary({ stats }) {
  if (!stats) return null

  const top = stats.by_category[0]
  const period =
    stats.first_date && stats.last_date
      ? stats.first_date === stats.last_date
        ? stats.first_date
        : `${stats.first_date} to ${stats.last_date}`
      : 'No reports yet'

  return (
    <ul className="tiles">
      <li className="tile">
        <span className="tile-value">{stats.total}</span>
        <span className="tile-label">Published reports</span>
      </li>
      <li className="tile">
        <span className="tile-value">{stats.recent.last_30_days}</span>
        <span className="tile-label">In the last 30 days</span>
      </li>
      <li className="tile">
        <span className="tile-value tile-text">{top ? label(top.code) : '—'}</span>
        <span className="tile-label">Most reported category</span>
      </li>
      <li className="tile">
        <span className="tile-value tile-text">{period}</span>
        <span className="tile-label">Date range</span>
      </li>
    </ul>
  )
}
