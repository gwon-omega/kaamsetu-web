import { provinces, getDistrictsByProvince } from "@shram-sewa/shared";
import { provinceVisuals } from "@shram-sewa/shared";

interface ProvinceGridProps {
  onSelectProvince: (provinceId: number) => void;
}

const PROVINCE_COLORS: Record<number, string> = {
  1: "#E63946", 2: "#F77F00", 3: "#38B000", 4: "#3A86FF",
  5: "#8338EC", 6: "#FF006E", 7: "#FB5607",
};

const PROVINCE_LANDMARKS: Record<number, string> = {
  1: "Kanchenjunga • Tea Gardens",
  2: "Janaki Mandir • Terai Plains",
  3: "Kathmandu Durbar • Pashupatinath",
  4: "Phewa Lake • Annapurna Range",
  5: "Lumbini • Birthplace of Buddha",
  6: "Rara Lake • Karnali Valley",
  7: "Shuklaphanta • Api Himal",
};

export default function ProvinceGrid({ onSelectProvince }: ProvinceGridProps) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="section-header slide-left">
        <h2 className="section-title">Browse by Province</h2>
      </div>
      <div className="province-grid stagger-children">
        {provinces.map((p) => {
          const distCount = getDistrictsByProvince(p.id).length;
          const color = PROVINCE_COLORS[p.id] || p.colorHex || "#7C1D2B";
          const visual = provinceVisuals.find(v => v.provinceId === p.id);
          const landmark = PROVINCE_LANDMARKS[p.id] || "";

          return (
            <button
              key={p.id}
              className="province-card"
              onClick={() => onSelectProvince(p.id)}
            >
              {/* Background image with low opacity */}
              {visual && (
                <img
                  src={visual.imageUrlSmall}
                  alt={p.nameEn}
                  className="province-card-bg"
                  loading="lazy"
                />
              )}
              {/* Dark gradient overlay */}
              <div className="province-card-overlay" />

              {/* Content */}
              <div className="province-card-content">
                <div className="province-dot" style={{ background: color, color }} />
                <div className="province-name">{p.nameEn}</div>
                <div className="province-np np">{p.nameNp}</div>
                <div className="province-meta">
                  {distCount} districts • {visual?.majorCityEn || ""}
                </div>
                {landmark && (
                  <div className="province-landmark">📍 {landmark}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
