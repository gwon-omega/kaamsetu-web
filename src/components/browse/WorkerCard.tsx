import { useState } from "react";
import type { WorkerItem } from "../../hooks/useWorkers";

const PROVINCE_COLORS: Record<number, string> = {
  1: "#E63946", 2: "#F77F00", 3: "#38B000", 4: "#3A86FF",
  5: "#8338EC", 6: "#FF006E", 7: "#FB5607",
};

interface WorkerCardProps {
  worker: WorkerItem;
  hired?: boolean;
  onHire: (worker: WorkerItem) => void;
}

export default function WorkerCard({ worker, hired, onHire }: WorkerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = PROVINCE_COLORS[worker.provinceId] || "#7C1D2B";
  const telHref = worker.phone ? `tel:+977${worker.phone.replace(/\D/g, "")}` : undefined;

  return (
    <div className={`worker-card ${hired ? "hired" : ""}`}>
      {/* Accent gradient stripe */}
      <div
        className="worker-card-accent"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}66, transparent)` }}
      />

      <div className="worker-card-body">
        {/* ── Header Row ── */}
        <div className="worker-header">
          <div
            className="worker-avatar"
            style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)`, borderColor: `${color}30` }}
          >
            <span className="worker-avatar-icon">{worker.jobIcon}</span>
            {worker.isAvailable && <span className="worker-available-dot" />}
          </div>

          <div className="worker-info">
            <div className="worker-name">{worker.fullName}</div>
            <div className="worker-skill" style={{ color }}>
              {worker.jobCategoryName}
              {worker.jobCategoryNp && (
                <span className="worker-skill-np np"> · {worker.jobCategoryNp}</span>
              )}
            </div>
            <div className="worker-location">
              📍 {worker.districtName}, Ward {worker.wardNo}
            </div>
          </div>

          <div className="worker-badges">
            <span className={`badge ${worker.isAvailable ? "badge-green" : "badge-gray"}`}>
              <span className="badge-dot" style={{ background: worker.isAvailable ? "var(--green-600)" : "#9CA3AF" }} />
              {worker.isAvailable ? "Available" : "Busy"}
            </span>
            {worker.dailyRateNpr && (
              <span className="worker-rate">
                Rs.{worker.dailyRateNpr}<span className="worker-rate-unit">/day</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="worker-stats-row">
          <div className="worker-stat-chip">
            <span className="worker-stat-icon">⭐</span>
            <span className="worker-stat-value">{worker.avgRating > 0 ? worker.avgRating.toFixed(1) : "—"}</span>
            <span className="worker-stat-sub">{worker.totalReviews > 0 ? `(${worker.totalReviews})` : ""}</span>
          </div>
          <div className="worker-stat-chip">
            <span className="worker-stat-icon">✅</span>
            <span className="worker-stat-value">{worker.totalHires}</span>
            <span className="worker-stat-sub">hires</span>
          </div>
          <div className="worker-stat-chip">
            <span className="worker-stat-icon">📊</span>
            <span className="worker-stat-value">{worker.experienceYrs}</span>
            <span className="worker-stat-sub">yr exp</span>
          </div>
          <div className="worker-stat-chip">
            <span className="worker-stat-icon">⛰️</span>
            <span className="worker-stat-value worker-stat-province">{worker.provinceName}</span>
          </div>
        </div>

        {/* ── Expandable Details ── */}
        {expanded && (
          <div className="worker-expand">
            <div className="worker-expand-row">
              <span className="worker-expand-label">Municipality</span>
              <span className="worker-expand-value">{worker.localUnitName}</span>
            </div>
            <div className="worker-expand-row">
              <span className="worker-expand-label">Ward</span>
              <span className="worker-expand-value">{worker.wardNo}</span>
            </div>
            {worker.phone && (
              <div className="worker-expand-row">
                <span className="worker-expand-label">Phone</span>
                <span className="worker-expand-value">{worker.phone}</span>
              </div>
            )}
            <div className="worker-expand-row">
              <span className="worker-expand-label">Registered</span>
              <span className="worker-expand-value">
                {new Date(worker.createdAt).toLocaleDateString("en-NP")}
              </span>
            </div>
          </div>
        )}

        {/* ── Actions (pushed to bottom via flex) ── */}
        <div className="worker-actions">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? "▴ Less" : "▾ Details"}
          </button>

          {hired ? (
            <div className="hired-badge">✓ Hired — Pending Confirmation</div>
          ) : (
            <>
              {telHref && (
                <a className="btn btn-sm btn-outline" href={telHref} aria-label={`Call ${worker.fullName}`}>
                  📞 Call
                </a>
              )}
              <button
                className="btn btn-sm btn-crimson btn-hire"
                onClick={() => onHire(worker)}
                disabled={!worker.isAvailable}
              >
                {worker.isAvailable ? "⚡ Hire Now" : "Not Available"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
