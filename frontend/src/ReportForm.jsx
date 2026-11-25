import { useState } from 'react'
import { createReport } from './api/reports'
import PickerMap from './PickerMap'
import { label } from './labels'
import { CATEGORIES, WHO, CONTEXTS, MOTIVATIONS, TIMES } from './options'

const today = () => new Date().toISOString().slice(0, 10)
const empty = { category: '', who: '', context: '', motivation: '', time_of_day: '', incident_date: today(), description: '' }

function Select({ name, values, set, options, required }) {
  return (
    <select value={values[name]} onChange={set(name)} required={required}>
      <option value="">{required ? 'Choose...' : 'Not specified'}</option>
      {options.map((o) => (
        <option key={o} value={o}>{label(o)}</option>
      ))}
    </select>
  )
}

export default function ReportForm() {
  const [position, setPosition] = useState(null)
  const [values, setValues] = useState(empty)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const set = (name) => (e) => setValues({ ...values, [name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!position || !values.category) return
    setStatus('sending')

    try {
      await createReport({
        lat: position.lat,
        lng: position.lng,
        category: values.category,
        who: values.who || null,
        context: values.context || null,
        motivation: values.motivation || null,
        time_of_day: values.time_of_day || null,
        incident_date: values.incident_date,
        description: values.description.trim() || null,
        lang: 'en',
      })
      setStatus('sent')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function reset() {
    setPosition(null)
    setValues({ ...empty, incident_date: today() })
    setStatus('idle')
  }

  if (status === 'sent') {
    return (
      <div className="card thanks">
        <h2>Thank you</h2>
        <p>Your report was sent anonymously. It will appear on the map after moderation.</p>
        <button onClick={reset}>Send another report</button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Report an incident</h2>

      <h3>1. Mark the location</h3>
      <p className="hint">Click the map to place the pin, then drag it to the exact spot. The position is randomly shifted before saving to protect your privacy.</p>
      <PickerMap onChange={setPosition} />
      <p className="hint">{position ? 'Pin placed.' : 'No pin yet.'}</p>

      <h3>2. Choose a category</h3>
      <Select name="category" values={values} set={set} options={CATEGORIES} required />

      <h3>3. Optional details</h3>
      <label>Who? <Select name="who" values={values} set={set} options={WHO} /></label>
      <label>Context <Select name="context" values={values} set={set} options={CONTEXTS} /></label>
      <label>Perceived motivation <Select name="motivation" values={values} set={set} options={MOTIVATIONS} /></label>
      <label>Time of day <Select name="time_of_day" values={values} set={set} options={TIMES} /></label>
      <label>Date <input type="date" value={values.incident_date} max={today()} onChange={set('incident_date')} required /></label>
      <label>
        Short description
        <textarea rows="4" maxLength="1000" value={values.description} onChange={set('description')} placeholder="Do not include names or phone numbers." />
      </label>

      <p className="hint">This platform does not replace contacting the police or support services.</p>

      {status === 'error' && <p className="error">Could not send: {error}</p>}
      <button type="submit" disabled={!position || !values.category || status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send report'}
      </button>
    </form>
  )
}
