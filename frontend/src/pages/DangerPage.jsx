export default function DangerPage() {
  return (
    <section className="danger-page">
      <div className="danger-top">
        <a className="danger-brand" href="#/">BeSafe</a>
      </div>

      <div className="danger-inner">
        <p className="eyebrow">YOUR SAFETY COMES FIRST</p>
        <h1>Are you in immediate danger?</h1>
        <p>
          BeSafe is not an emergency service. Do not wait for a report to be
          reviewed if you need immediate help.
        </p>

        <a className="danger-call" href="tel:112">
          <span>Emergency services</span>
          <strong>112</strong>
        </a>

        <a className="danger-call" href="tel:102">
          <span>Police</span>
          <strong>102</strong>
        </a>

        <div className="danger-actions">
          <a className="btn btn-secondary" href="#/get-help">
            Other support
          </a>
          <a className="link-quiet" href="#/">
            Return to BeSafe
          </a>
        </div>
      </div>
    </section>
  )
}
