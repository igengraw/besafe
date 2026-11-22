import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import MapView from './MapView'
import ReportForm from './ReportForm'
import { label } from './labels'

export default function App() {
  const [view, setView] = useState('home') // 'home' | 'report'
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('id, lat, lng, category, who, context, time_of_day, incident_date')
        .eq('status', 'approved')
        .order('incident_date', { ascending: false })

      if (error) setError(error.message)
      else setReports(data)
      setLoading(false)
    }
    loadReports()
  }, [])

  return (
    <div className="page">
      <header className="hero">
        <h1>BeSafe</h1>
        <p>Report anonymously. See where action is needed.</p>
        <nav className="nav">
          <button className={view === 'home' ? '' : 'secondary'} onClick={() => setView('home')}>Map</button>
          <button className={view === 'report' ? '' : 'secondary'} onClick={() => setView('report')}>Report an incident</button>
        </nav>
      </header>

      <main>
        {view === 'report' ? (
          <ReportForm />
        ) : (
          <>
            {loading && <p>Loading...</p>}
            {error && <p className="error">Error: {error}</p>}
            <MapView reports={reports} />
            <h2>Published reports ({reports.length})</h2>
            <ul className="list">
              {reports.map((r) => (
                <li key={r.id} className="card">
                  <strong>{label(r.category)}</strong>
                  <span>{label(r.context)}</span>
                  <span>{label(r.time_of_day)}</span>
                  <span>{label(r.who)}</span>
                  <span>{r.incident_date}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}