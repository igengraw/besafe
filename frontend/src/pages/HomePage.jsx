import { useEffect, useState } from 'react'
import { getStats } from '../api/stats'
import { label } from '../labels'

const STEPS = [
  {
    title: 'Describe the area',
    text: 'Pick a district and a few categories. No exact address, no description of a person.',
  },
  {
    title: 'Moderators review',
    text: 'Trained moderators remove identifying details before anything is published.',
  },
  {
    title: 'Patterns appear',
    text: 'Reports become area summaries on the map, helping students plan and organisations act.',
  },
]

export default function HomePage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {})
  }, [])

  const topTime = stats?.by_time_of_day?.[0]?.code
  const topCategory = stats?.by_category?.[0]?.code
  const caption = stats
    ? `${stats.total} reports · ${topTime ? `${label(topTime)} peak` : 'no peak yet'}`
    : 'Approved reports only'

  return (
    <>
      <section className="shell">
        <div className="home-hero">
          <div>
            <p className="eyebrow">Almaty · Student safety</p>
            <h1>
              Say it safely.
              <br />
              See it clearly.
            </h1>
            <p className="hero-lead">
              An anonymous way to report harassment and see which areas of Almaty students
              feel unsafe. No name, no account, no tracking.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#/report">
                Report an incident
              </a>
              <a className="btn btn-secondary" href="#/map">
                Explore the map
              </a>
            </div>
            <div className="hero-points">
              <span>No account</span>
              <span>No IP logging</span>
              <span>Moderated</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <span className="hero-badge">Sample data</span>
            <span className="hero-blob one" />
            <span className="hero-blob two" />
            <span className="hero-blob three" />
            <span className="hero-caption">{caption}</span>
          </div>
        </div>

        <div className="step-grid">
          {STEPS.map((step, index) => (
            <article className="step-card" key={step.title}>
              <div className="step-num">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="home-stats">
          <div className="home-stat">
            <strong>{stats?.total ?? '—'}</strong>
            <span>Published reports</span>
          </div>
          <div className="home-stat">
            <strong>{stats?.recent?.last_30_days ?? '—'}</strong>
            <span>In the last 30 days</span>
          </div>
          <div className="home-stat">
            <strong>{topCategory ? label(topCategory) : '—'}</strong>
            <span>Most reported category</span>
          </div>
          <a className="text-link" href="#/stats">
            More statistics →
          </a>
        </div>
      </section>
    </>
  )
}
