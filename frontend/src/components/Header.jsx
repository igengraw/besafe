import Logo from './Logo'

const NAV = [
  { path: '/', label: 'Home' },
  { path: '/map', label: 'Map' },
  { path: '/report', label: 'Report' },
  { path: '/help', label: 'Help' },
]

export function quickExit() {
  // Leave Besafe immediately and replace the history entry.
  window.location.replace('https://www.google.com/search?q=weather+almaty')
}

export default function Header({ path }) {
  const isHelp = path === '/help'
  const isReport = path.startsWith('/report')

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#/" aria-label="Besafe home">
          <Logo size={34} />
          <span>Besafe</span>
        </a>

        <nav className="main-nav" aria-label="Main">
          {NAV.map((item) => {
            const active =
              item.path === '/' ? path === '/' : path === item.path || (item.path === '/report' && isReport)
            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                className={active ? 'is-active' : ''}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="header-actions">
          <span className="lang-switch" aria-label="Language">
            <button type="button" className="is-active">EN</button>
            <span aria-hidden="true">·</span>
            <button type="button" disabled title="Coming in step 7">KK</button>
            <span aria-hidden="true">·</span>
            <button type="button" disabled title="Coming in step 7">RU</button>
          </span>

          {isHelp ? (
            <button type="button" className="btn btn-quiet btn-sm" onClick={quickExit}>
              Quick exit <span aria-hidden="true">✕</span>
            </button>
          ) : (
            <a className="btn btn-primary btn-sm" href="#/report">
              Report an incident
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
