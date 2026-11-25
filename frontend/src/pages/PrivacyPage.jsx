const SECTIONS = [
  {
    id: 'principles',
    title: '1. Our privacy principles',
    paragraphs: [
      'BeSafe is designed to collect reports without requiring a personal account or a name.',
      'You should not include names, phone numbers, exact addresses or other identifying details in a report.',
    ],
  },
  {
    id: 'information',
    title: '2. Information in a report',
    paragraphs: [
      'A report can contain an approximate area, an incident category, information about who was involved, a date, a part of the day and an optional description.',
      'The application sends these report fields to its database so reports can be reviewed and aggregated.',
    ],
  },
  {
    id: 'moderation',
    title: '3. Moderation and publication',
    paragraphs: [
      'Submitted reports are not automatically published. They are stored with a pending status until reviewed.',
      'Only approved reports are used in public map and statistical views.',
    ],
  },
  {
    id: 'location',
    title: '4. Location information',
    paragraphs: [
      'The report form asks you to select an approximate district or area rather than entering your home address or exact location.',
      'The application uses the selected area coordinates. Do not interpret this as a guarantee that every technical or infrastructure log contains no location information.',
    ],
  },
  {
    id: 'choices',
    title: '5. Your choices',
    paragraphs: [
      'The description is optional. You can leave it blank and should avoid sharing details that identify you or another person.',
      'You can review the information you enter before submitting your report.',
    ],
  },
  {
    id: 'contact',
    title: '6. Questions',
    paragraphs: [
      'For questions about the project, its operation or privacy practices, use the Help section.',
      'BeSafe is an informational project and is not a replacement for emergency or professional support.',
    ],
  },
]

export default function PrivacyPage() {
  function goToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section className="shell page">
      <p className="eyebrow">YOUR INFORMATION</p>
      <h1>Privacy policy</h1>
      <p className="page-lead">
        How BeSafe handles reports and why we encourage you to avoid sharing
        identifying information.
      </p>

      <div className="privacy-layout">
        <nav className="privacy-toc" aria-label="Privacy policy sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => goToSection(section.id)}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="privacy-sections">
          {SECTIONS.map((section) => (
            <article
              className="privacy-section"
              id={section.id}
              key={section.id}
            >
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
