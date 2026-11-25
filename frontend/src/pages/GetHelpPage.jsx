export default function GetHelpPage() {
  return (
    <section className="shell page">
      <p className="eyebrow">SUPPORT IN ALMATY</p>
      <h1>You are not alone.</h1>
      <p className="page-lead">
        Your safety comes first. Choose the kind of support that is appropriate
        for your situation.
      </p>

      <div className="help-cards">
        <article className="plain-card">
          <p className="eyebrow">EMERGENCY</p>
          <h3>Immediate danger</h3>
          <p>
            When someone's safety is at immediate risk, contact emergency
            services rather than waiting for a response from BeSafe.
          </p>
          <a className="btn btn-primary" href="tel:112">Call 112</a>
        </article>

        <article className="plain-card">
          <p className="eyebrow">POLICE</p>
          <h3>Need police assistance?</h3>
          <p>
            Contact the police directly when you need urgent police assistance.
            BeSafe does not dispatch emergency services.
          </p>
          <a className="btn btn-primary" href="tel:102">Call 102</a>
        </article>

        <article className="plain-card">
          <p className="eyebrow">PERSONAL SUPPORT</p>
          <h3>Talk to someone you trust</h3>
          <p>
            Consider contacting a trusted friend, family member or support
            professional. You decide what you feel comfortable sharing.
          </p>
          <a className="btn btn-secondary" href="#/help">Read safety information</a>
        </article>
      </div>

      <div className="plain-card" style={{ marginTop: 30 }}>
        <h3>A few things you can do right now</h3>
        <ul className="check-list">
          <li>Move to a place where you feel safer, if possible.</li>
          <li>Contact someone you trust.</li>
          <li>Seek medical assistance if you are injured or unwell.</li>
          <li>Do not put yourself at risk to collect evidence.</li>
        </ul>
      </div>
    </section>
  )
}
