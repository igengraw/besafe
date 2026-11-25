export default function HelpPage() {
  return (
    <section className="shell page">
      <p className="eyebrow">SUPPORT</p>
      <h1>Help & privacy</h1>
      <p className="page-lead">
        BeSafe helps people share experiences and understand safety patterns
        across Almaty. Here is how to use the project safely.
      </p>

      <div className="help-grid">
        <article className="danger-card">
          <p className="eyebrow">IMMEDIATE SUPPORT</p>
          <h2>Are you in danger now?</h2>
          <p>
            BeSafe is not an emergency service. Contact emergency services
            directly if you need urgent help.
          </p>
          <a className="call-row" href="tel:112">
            <span>Emergency services</span>
            <strong>112</strong>
          </a>
          <a className="call-row" href="tel:102">
            <span>Police</span>
            <strong>102</strong>
          </a>
        </article>

        <article className="plain-card">
          <h3>Your privacy matters</h3>
          <ul className="check-list">
            <li>No account is required to submit a report</li>
            <li>You choose the approximate area</li>
            <li>Personal details are not needed</li>
            <li>Reports are reviewed before publication</li>
          </ul>
        </article>

        <article className="plain-card">
          <h3>How to make a report</h3>
          <ul className="check-list">
            <li>Select the area</li>
            <li>Choose the incident category</li>
            <li>Select the approximate time and day</li>
            <li>Share additional details only when comfortable</li>
          </ul>
        </article>
      </div>

      <h2 style={{ marginTop: 54 }}>Frequently asked questions</h2>
      <div className="faq-grid">
        <article className="faq-card">
          <h3>Is BeSafe anonymous?</h3>
          <p>
            The form does not ask for your name or account. Choose only an
            approximate area and avoid including identifying details.
          </p>
        </article>
        <article className="faq-card">
          <h3>Will my report appear immediately?</h3>
          <p>
            No. Reports are submitted for moderation. Only approved reports
            are included in public map information.
          </p>
        </article>
        <article className="faq-card">
          <h3>Can I skip the description?</h3>
          <p>
            Yes. The description is optional. The other required selections
            help organise anonymous reports.
          </p>
        </article>
      </div>
    </section>
  )
}
