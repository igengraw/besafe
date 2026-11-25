import { useEffect, useState } from 'react'

// Tiny hash router: no extra dependency, deep links still work.
export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, search = ''] = raw.split('?')
  return { path: path || '/', params: new URLSearchParams(search) }
}

export function navigate(to) {
  const next = `#${to}`
  if (window.location.hash === next) {
    window.scrollTo({ top: 0 })
    return
  }
  window.location.hash = to
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
