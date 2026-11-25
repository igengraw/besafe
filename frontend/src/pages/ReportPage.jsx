import { useEffect, useState } from 'react'
import { createReport } from '../api/reports'
import { AREAS, DISTRICTS, areaById } from '../data/districts'
import { CATEGORY_OPTIONS, WHO_OPTIONS, TIME_OPTIONS, DAY_OPTIONS } from '../options'

const DRAFT_KEY = 'besafe:report-draft'

const STEPS = [
  { title: 'Area', note: 'Where did it happen' },
  { title: 'Incident', note: 'What happened' },
  { title: 'Time', note: 'When it happened' },
  { title: 'Person', note: 'Who was involved' },
  { title: 'Details', note: 'Anything else' },
]

const EMPTY = {
  area: '',
  category: '',
  time_of_day: '',
  day: 'today',
  who: 'private',
  description: '',
}

// Loose phone detector: enough to catch 8+ digit sequences with spaces,
// dashes or brackets. We only warn, the person decides what to do.
const PHONE_RE = /(\+?\d[\d\s().-]{6,}\d)/

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function dateFromDay(day) {
  const offset = DAY_OPTIONS.find((option) => option.id === day)?.offset ?? 0
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return date.toISOString().slice(0, 10)
}

function prettyDate(iso) {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
}

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      step: Number.isInteger(parsed?.step) ? parsed.step : 0,
      values: { ...EMPTY, ...(parsed?.values || {}) },
    }
  } catch {
    return null
  }
}

function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Private mode or a full storage quota: the report still works in memory.
  }
}

export default function ReportPage({ initialArea }) {
  const [restored] = useState(() => readDraft())
  const [step, setStep] = useState(restored?.step ?? 0)
  const [values, setValues] = useState(() => {
    const base = restored?.values ?? EMPTY
    if (initialArea && areaById(initialArea)) return { ...base, area: initialArea }
    return base
  })
  const [status, setStatus] = useState('wizard') // wizard | sending | success | error
  const [error, setError] = useState('')
  const [phoneWarning, setPhoneWarning] = useState(false)

  useEffect(() => {
    if (status === 'wizard') saveDraft({ step, values })
  }, [step, values, status])

  const area = areaById(values.area)
  const category = CATEGORY_OPTIONS.find((option) => option.value === values.category)
  const time = TIME_OPTIONS.find((option) => option.value === values.time_of_day)
  const day = DAY_OPTIONS.find((option) => option.id === values.day)
  const who = WHO_OPTIONS.find((option) => option.id === values.who)
  const incidentDate = dateFromDay(values.day)

  const canContinue = [
    Boolean(values.area),
    Boolean(values.category),
    Boolean(values.time_of_day),
    Boolean(values.who),
    true,
  ][step]

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    if (field === 'description') setPhoneWarning(PHONE_RE.test(value))
  }

  function next() {
    if (!canContinue) return
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function fixDescription() {
    const cleaned = values.description
      .replace(new RegExp(PHONE_RE.source, 'g'), '[removed]')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
    update('description', cleaned)
    setPhoneWarning(false)
  }

  function reset() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
    setValues(EMPTY)
    setStep(0)
    setError('')
    setPhoneWarning(false)
    setStatus('wizard')
  }

  async function submit() {
    if (!area || !values.category) return
    setStatus('sending')
    setError('')

    try {
      await createReport({
        lat: area.center[0],
        lng: area.center[1],
        category: values.category,
        who: who?.value ?? null,
        context: null,
        motivation: null,
        time_of_day: values.time_of_day || null,
        incident_date: incidentDate || todayISO(),
        description: values.description.trim() || null,
        lang: 'en',
      })
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // ignore
      }
      setStatus('success')
      window.scrollTo({ top: 0 })
    } catch (err) {
      setStatus('error')
      setError(err.message)
      window.scrollTo({ top: 0 })
    }
  }

  if (status === 'success') return <SuccessView onReset={reset} />

  if (status === 'error') {
    return (
      <section className="shell">
        <div className="error-page">
          <div className="error-icon" aria-hidden="true">
            !
          </div>
          <h1>Report not sent</h1>
          <p>
            The connection dropped or the server refused the report. Nothing was published,
            and your answers are still saved on this device.
          </p>

          <div className="draft-card">
            <p className="field-label">Saved draft</p>
            <ul className="check-list">
              <li>{area ? area.name : 'Area not chosen'}</li>
              <li>{category ? category.title : 'Incident type not chosen'}</li>
              <li>
                {time ? time.title : 'Time not chosen'}
                {day ? ` · ${day.title}` : ''}
              </li>
            </ul>
            {error && <p className="info-strip">Server said: {error}</p>}
          </div>

          <div className="error-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStatus('wizard')}>
              Try again
            </button>
            <a className="btn btn-secondary" href="#/help">
              Get help now
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="report-page">
      <div className={step === 1 ? 'report-layout has-aside' : 'report-layout'}>
        <nav className="report-stepper" aria-label="Report steps">
          <p className="stepper-title">Your report</p>
          {STEPS.map((item, index) => {
            const state = index === step ? 'is-current' : index < step ? 'is-done' : ''
            return (
              <div className={`stepper-item ${state}`.trim()} key={item.title}>
                <span className="stepper-dot" aria-hidden="true">
                  {index < step ? '✓' : index + 1}
                </span>
                <span>
                  {item.title}
                  <small style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>
                    {item.note}
                  </small>
                </span>
              </div>
            )
          })}
        </nav>

        <div className="report-card">
          <p className="step-kicker">
            Step {step + 1} of {STEPS.length}
          </p>

          {step === 0 && (
            <>
              <h1>Where did it happen?</h1>
              <p className="report-lead">
                Choose a district or the area you know best. We never ask for a street or an
                exact address.
              </p>
              <div className="report-body">
                <div className="area-picker">
                  <div className="area-map" role="group" aria-label="Area map">
                    {AREAS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={values.area === item.id ? 'area-tile is-selected' : 'area-tile'}
                        aria-pressed={values.area === item.id}
                        onClick={() => update('area', item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <div className="area-list" role="radiogroup" aria-label="Districts">
                    {DISTRICTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={values.area === item.id}
                        className={
                          values.area === item.id ? 'area-option is-selected' : 'area-option'
                        }
                        onClick={() => update('area', item.id)}
                      >
                        <span className="area-radio" aria-hidden="true" />
                        <span>
                          {item.name}
                          <small>{item.note}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="info-strip">
                  The saved point is moved by 100–300 metres inside the district, so it can
                  never be traced back to you.
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1>What happened?</h1>
              <p className="report-lead">
                Pick the closest match. There is no wrong answer, and you can add detail
                later.
              </p>
              <div className="report-body">
                <div className="option-grid" role="radiogroup" aria-label="Incident type">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={values.category === option.value}
                      className={
                        values.category === option.value
                          ? 'option-card is-selected'
                          : 'option-card'
                      }
                      onClick={() => update('category', option.value)}
                    >
                      <strong>{option.title}</strong>
                      <span>{option.note}</span>
                    </button>
                  ))}
                </div>

                <p className="info-strip">
                  One report per situation is enough. If it happened more than once, describe
                  the most recent time.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>When did it happen?</h1>
              <p className="report-lead">
                A rough time is enough. We only store the date and a part of the day, never
                a timestamp.
              </p>
              <div className="report-body">
                <p className="field-label">Part of the day</p>
                <div className="option-grid four" role="radiogroup" aria-label="Time of day">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={values.time_of_day === option.value}
                      className={
                        values.time_of_day === option.value
                          ? 'option-card is-selected'
                          : 'option-card'
                      }
                      onClick={() => update('time_of_day', option.value)}
                    >
                      <strong>{option.title}</strong>
                      <span>{option.note}</span>
                    </button>
                  ))}
                </div>

                <p className="field-label" style={{ marginTop: 26 }}>
                  Day
                </p>
                <div className="option-grid four" role="radiogroup" aria-label="Day">
                  {DAY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={values.day === option.id}
                      className={
                        values.day === option.id ? 'option-card is-selected' : 'option-card'
                      }
                      onClick={() => update('day', option.id)}
                    >
                      <strong>{option.title}</strong>
                      <span>{prettyDate(dateFromDay(option.id))}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1>Who was involved?</h1>
              <p className="report-lead">
                This helps see patterns. Choose “Prefer not to say” if you would rather skip
                it.
              </p>
              <div className="report-body">
                <div className="option-grid four" role="radiogroup" aria-label="Who was involved">
                  {WHO_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={values.who === option.id}
                      className={
                        values.who === option.id
                          ? 'option-card with-radio is-selected'
                          : 'option-card with-radio'
                      }
                      onClick={() => update('who', option.id)}
                    >
                      <span className="option-radio" aria-hidden="true" />
                      <span>
                        <strong>{option.title}</strong>
                        <span>{option.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1>Anything else?</h1>
              <p className="report-lead">
                Optional. Describe what happened in your own words. Please leave out names,
                phone numbers and addresses.
              </p>
              <div className="report-body">
                <label className="field-label" htmlFor="description">
                  Short description (optional)
                </label>
                <textarea
                  id="description"
                  className={phoneWarning ? 'textarea is-warning' : 'textarea'}
                  maxLength={1000}
                  value={values.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="For example: a group followed me from the bus stop and kept shouting. I left towards the main road."
                />
                <p className="map-note">
                  {values.description.length} / 1000 characters
                </p>

                {phoneWarning && (
                  <div className="warning" role="alert">
                    <span>
                      It looks like a phone number. Numbers are visible to moderators and can
                      identify someone.
                    </span>
                    <button type="button" onClick={fixDescription}>
                      Fix it
                    </button>
                  </div>
                )}

                <div className="summary-row">
                  {area && <span className="summary-chip">{area.name}</span>}
                  {category && <span className="summary-chip">{category.title}</span>}
                  {time && (
                    <span className="summary-chip">
                      {time.title}
                      {day ? ` · ${day.title.toLowerCase()}` : ''}
                    </span>
                  )}
                  {who && <span className="summary-chip">{who.title}</span>}
                </div>

                <p className="info-strip" style={{ marginTop: 22 }}>
                  On send, the report becomes <strong>pending</strong>. Moderators check it
                  for identifying details, then it appears on the map. You can close this tab
                  after sending; nothing is sent twice.
                </p>
              </div>
            </>
          )}

          <div className="report-footer">
            {step > 0 ? (
              <button type="button" className="btn btn-secondary" onClick={back}>
                Back
              </button>
            ) : (
              <span />
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={next}
                disabled={!canContinue}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={submit}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send report'}
              </button>
            )}
          </div>

          <p className="privacy-note" style={{ marginTop: 22 }}>
            No account, no IP logging. A draft is kept only in this browser.
          </p>
        </div>

        {step === 1 && (
          <aside className="report-aside">
            <div className="privacy-card">
              <h3>Your report is anonymous</h3>
              <ul>
                <li>No name or account</li>
                <li>No exact location</li>
                <li>No device or IP address</li>
                <li>Moderated before publishing</li>
              </ul>
            </div>

            <div className="danger-mini">
              <strong>Are you in danger now?</strong>
              <p>
                Besafe is not an emergency service. Call <a href="tel:112">112</a> or{' '}
                <a href="tel:102">102</a>.
              </p>
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}

function SuccessView({ onReset }) {
  return (
    <section className="shell">
      <div className="result-page">
        <div className="result-grid">
          <div>
            <div className="result-icon" aria-hidden="true">
              <span>✓</span>
            </div>
            <p className="eyebrow">Report received</p>
            <h1>Thank you for telling us.</h1>
            <p>
              Your report was sent without your name. Moderators will review it and remove
              anything identifying before it becomes an area summary on the map.
            </p>
            <div className="result-actions">
              <a className="btn btn-primary" href="#/map">
                See the map
              </a>
              <a className="btn btn-secondary" href="#/">
                Back to home
              </a>
            </div>
          </div>

          <div>
            <div className="timeline">
              <div className="timeline-item is-done">
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <strong>Sent</strong>
                  <span>Just now. Stored as pending.</span>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <strong>Moderation</strong>
                  <span>Usually within a few days. Identifying details are removed.</span>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <strong>On the map</strong>
                  <span>Only the district, category, part of day and date are shown.</span>
                </div>
              </div>
            </div>

            <a className="help-banner" href="#/get-help">
              <strong>Need support now?</strong>
              <span>Find helplines, centres and legal aid in Almaty →</span>
            </a>

            <p className="map-note" style={{ marginTop: 18 }}>
              Want to report another situation?{' '}
              <button type="button" className="link-quiet" onClick={onReset} style={{ color: 'var(--slate)', fontWeight: 600 }}>
                Start a new report
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
