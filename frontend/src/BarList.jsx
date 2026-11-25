import { label } from './labels'

// One horizontal bar per code. The longest bar fills the track, the rest are
// relative to it, so the page shows proportions without any chart library.
export default function BarList({ title, items, empty = 'No data yet' }) {
  const max = items.reduce((m, item) => Math.max(m, item.count), 0)

  return (
    <section className="card stats-block">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="hint">{empty}</p>
      ) : (
        <ul className="bars">
          {items.map(({ code, count }) => (
            <li key={code}>
              <span className="bar-label">{label(code)}</span>
              <span className="bar-track" aria-hidden="true">
                <span
                  className="bar-fill"
                  style={{ width: `${max ? Math.max(4, (count / max) * 100) : 0}%` }}
                />
              </span>
              <span className="bar-count">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
