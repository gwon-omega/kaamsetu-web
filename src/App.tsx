const highlights = [
  { label: "Local Units", value: "753" },
  { label: "District Coverage", value: "77" },
  { label: "Target Workers", value: "37,650+" },
];

const categories = [
  "Mason",
  "Plumber",
  "Electrician",
  "Painter",
  "Gardener",
  "General Labour",
];

const steps = [
  {
    title: "Search by Province & Ward",
    description:
      "Find available workers near your local unit using district, ward, and skill filters.",
  },
  {
    title: "Send Hire Request",
    description:
      "Submit work date, days, and proposed rate. Workers receive real-time notification.",
  },
  {
    title: "Track & Complete",
    description:
      "Manage status, record completion, and rate the worker for transparent hiring history.",
  },
];

function App() {
  return (
    <div className="app-shell">
      <div className="noise" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">श्रम सेवा</div>
        <div className="locale">Nepal Local Manpower Registry</div>
      </header>

      <main className="content">
        <section className="hero card">
          <p className="eyebrow">Domestic Worker Hiring</p>
          <h1>श्रम सेवा — Nepal Manpower Platform</h1>
          <p className="subtitle">
            A district-to-ward hiring network for local governments and hirers
            to connect with verified workers across Nepal.
          </p>

          <div className="action-row">
            <button type="button" className="btn btn-primary">
              Search Workers
            </button>
            <button type="button" className="btn btn-secondary">
              Register as Worker
            </button>
          </div>
        </section>

        <section className="stats-grid">
          {highlights.map((item) => (
            <article key={item.label} className="stat-card card">
              <p className="stat-value">{item.value}</p>
              <p className="stat-label">{item.label}</p>
            </article>
          ))}
        </section>

        <section className="grid-two">
          <article className="card">
            <h2>Popular Skills</h2>
            <div className="chip-list">
              {categories.map((skill) => (
                <span className="chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </article>

          <article className="card">
            <h2>What You Get</h2>
            <ul className="benefits">
              <li>Verified worker profiles with local-unit context</li>
              <li>Structured hire records and auditable status tracking</li>
              <li>PWA-ready experience for low-connectivity environments</li>
              <li>Notification-ready architecture for worker response loops</li>
            </ul>
          </article>
        </section>

        <section className="card">
          <h2>How Hiring Works</h2>
          <div className="steps">
            {steps.map((step, index) => (
              <article key={step.title} className="step-item">
                <span className="step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
