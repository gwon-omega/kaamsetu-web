export default function InfoCards() {
  const cards = [
    {
      icon: "✅",
      title: "Verified Workers",
      titleNp: "प्रमाणित कामदार",
      desc: "Every worker is verified by their local ward office, ensuring trust and accountability.",
      accent: "var(--green-600)",
      bg: "var(--green-50)",
    },
    {
      icon: "⚡",
      title: "Instant Hiring",
      titleNp: "तुरुन्तै भाडामा",
      desc: "Find available workers near you and hire with a single click. No middlemen, no hidden fees.",
      accent: "var(--gold-500)",
      bg: "var(--yellow-50)",
    },
    {
      icon: "🗺️",
      title: "All 77 Districts",
      titleNp: "सबै ७७ जिल्ला",
      desc: "Coverage across every province, district, and municipality in Nepal — urban and rural.",
      accent: "var(--mountain-500)",
      bg: "var(--mountain-50)",
    },
    {
      icon: "🛡️",
      title: "Government Backed",
      titleNp: "सरकारी समर्थित",
      desc: "Built for local government integration with transparent, auditable hiring records.",
      accent: "var(--crimson-700)",
      bg: "var(--crimson-50)",
    },
  ];

  return (
    <section className="section">
      <div className="section-header animate-in">
        <h2 className="section-title">Why श्रम सेवा?</h2>
      </div>
      <div className="info-cards-grid stagger-children">
        {cards.map((c) => (
          <div className="info-card" key={c.title}>
            <div
              className="info-card-badge"
              style={{ background: c.bg, color: c.accent }}
            >
              {c.icon}
            </div>
            <div className="info-card-content">
              <h3 className="info-card-title">
                {c.title}
                <span className="info-card-title-np np"> {c.titleNp}</span>
              </h3>
              <p className="info-card-desc">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
