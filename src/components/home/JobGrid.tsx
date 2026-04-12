import { jobCategories } from "@shram-sewa/shared";

interface JobGridProps {
  onSelectJob: (slug: string) => void;
  onSeeAll: () => void;
}

export default function JobGrid({ onSelectJob, onSeeAll }: JobGridProps) {
  return (
    <section className="section">
      <div className="section-header slide-left">
        <h2 className="section-title">Job Categories</h2>
        <button className="section-link" onClick={onSeeAll}>See all workers →</button>
      </div>
      <div className="job-grid stagger-children">
        {jobCategories.map((j) => (
          <button key={j.slug} className="job-card" onClick={() => onSelectJob(j.slug)}>
            <div className="job-card-icon">{j.icon}</div>
            <div className="job-card-name">{j.nameEn}</div>
            <div className="job-card-np np">{j.nameNp}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
