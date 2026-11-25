import { useRoute } from './router'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import ReportPage from './pages/ReportPage'
import HelpPage from './pages/HelpPage'
import GetHelpPage from './pages/GetHelpPage'
import PrivacyPage from './pages/PrivacyPage'
import AboutPage from './pages/AboutPage'
import HowItWorksPage from './pages/HowItWorksPage'
import DangerPage from './pages/DangerPage'
import StatsPage from './pages/StatsPage'

export default function App() {
  const { path, params } = useRoute()

  if (path === '/danger') return <DangerPage />

  const page = (() => {
    switch (path) {
      case '/map':
        return <MapPage />
      case '/report':
        return <ReportPage initialArea={params.get('area')} />
      case '/help':
        return <HelpPage />
      case '/get-help':
        return <GetHelpPage />
      case '/privacy':
        return <PrivacyPage />
      case '/about':
        return <AboutPage />
      case '/how-it-works':
        return <HowItWorksPage />
      case '/stats':
        return <StatsPage />
      default:
        return <HomePage />
    }
  })()

  const flush = path === '/map' || path === '/report'

  return (
    <div className="app">
      <Header path={path} />
      <main className={flush ? 'app-main app-main--flush' : 'app-main'}>{page}</main>
      {!flush && <Footer />}
    </div>
  )
}
