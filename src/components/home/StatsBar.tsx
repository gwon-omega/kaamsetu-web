
import { useWorkerCount } from "../../hooks/useWorkers";

export default function StatsBar() {
  const { data } = useWorkerCount();

  const stats = [
    { value: data?.total ?? "—", label: "Registered Workers", icon: "👷", color: "var(--crimson-700)" },
    { value: data?.available ?? "—", label: "Available Now", icon: "✅", color: "var(--green-500)" },
    { value: "77", label: "Districts", icon: "🗺️", color: "var(--mountain-500)" },
    { value: "753+", label: "Local Units", icon: "🏛️", color: "var(--gold-500)" },
    { value: "12", label: "Job Categories", icon: "🧰", color: "var(--crimson-500)" },
  ];

  return (
    <div className="stats-bar animate-in">
      <div className="stats-bar-inner stagger-children">
        {stats.map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-value" style={{ color: s.color }}>
              {s.icon} {s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
