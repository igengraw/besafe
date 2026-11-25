const TEAM = [
  { initials: 'AM', name: 'Azamat Mauiya' },
  { initials: 'ME', name: 'Malika Elmuratova' },
  { initials: 'DK', name: 'Dinmukhamed Kashayev' },
  { initials: 'ZI', name: 'Zhanserik Izdibay' },
]

export default function AboutPage() {
  return (
    <section className="shell page">
      <p className="eyebrow">ABOUT THE PROJECT</p>
      <h1>Making communities safer together.</h1>
      <p className="page-lead">
        BeSafe Almaty is a project designed to help people report unsafe
        experiences and understand patterns through anonymous, moderated data.
      </p>

      <div className="plain-card" style={{ marginTop: 40 }}>
        <h3>Our purpose</h3>
        <p>
          Individual experiences can reveal broader patterns. BeSafe provides
          a structured way to share those experiences and explore approved
          reports by area, category and time.
        </p>
      </div>

      <h2 style={{ marginTop: 54 }}>The team</h2>
      <div className="team-grid">
        {TEAM.map((person) => (
          <article className="team-card" key={person.name}>
            <div className="avatar" aria-hidden="true">{person.initials}</div>
            <strong>{person.name}</strong>
          </article>
        ))}
      </div>

      <h2 style={{ marginTop: 54 }}>What matters to us</h2>
      <div className="faq-grid">
        <article className="faq-card">
          <h3>Privacy</h3>
          <p>Collect only the information needed to understand reported patterns.</p>
        </article>
        <article className="faq-card">
          <h3>Respect</h3>
          <p>Every person should be able to share an experience without judgement.</p>
        </article>
        <article className="faq-card">
          <h3>Responsibility</h3>
          <p>Reports are reviewed before they contribute to public information.</p>
        </article>
      </div>
    </section>
  )
}
