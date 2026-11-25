const STEPS = [
  {
    number: '01',
    title: 'Choose an area',
    text: 'Select the district or approximate area where the incident happened. No street address is requested.',
  },
  {
    number: '02',
    title: 'Describe the incident type',
    text: 'Choose the category that best matches your experience.',
  },
  {
    number: '03',
    title: 'Select the time',
    text: 'Choose a part of the day and an approximate day. An exact timestamp is not required.',
  },
  {
    number: '04',
    title: 'Share who was involved',
    text: 'Select the option that feels appropriate. You can choose not to specify.',
  },
  {
    number: '05',
    title: 'Add optional details',
    text: 'You can add a short description, but leave out names, phone numbers and addresses.',
  },
  {
    number: '06',
    title: 'Moderation and map',
    text: 'Your report is submitted for review. Approved reports contribute to aggregate map information.',
  },
]

export default function HowItWorksPage() {
  return (
    <section className="shell page">
      <p className="eyebrow">THE PROCESS</p>
      <h1>How BeSafe works</h1>
      <p className="page-lead">
        A simple reporting process designed to collect useful information
        without asking for unnecessary personal details.
      </p>

      <div className="faq-grid">
        {STEPS.map((step) => (
          <article className="faq-card" key={step.number}>
            <p className="eyebrow">{step.number}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <div className="plain-card" style={{ marginTop: 36 }}>
        <h3>What happens after submission?</h3>
        <p>
          A submitted report receives a pending status. It is reviewed before
          approval. Public map information is based on approved reports rather
          than unreviewed submissions.
        </p>
        <a className="btn btn-primary" href="#/report" style={{ marginTop: 20 }}>
          Make a report
        </a>
      </div>
    </section>
  )
}
