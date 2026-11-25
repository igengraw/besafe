import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <Logo size={26} />
          <span>Besafe</span>
        </div>

        <nav className="footer-links" aria-label="Secondary">
          <a href="#/about">About</a>
          <a href="#/how-it-works">How it works</a>
          <a href="#/privacy">Privacy</a>
          <a href="#/get-help">Get help</a>
          <a href="#/stats">Statistics</a>
        </nav>

        <p className="footer-note">
          Besafe does not replace the police or support services. If you are in danger, call
          102 or 112.
        </p>
      </div>
    </footer>
  )
}
