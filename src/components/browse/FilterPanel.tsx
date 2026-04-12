import { useState } from "react";
import { provinces, getDistrictsByProvince } from "@shram-sewa/shared";
import { jobCategories } from "@shram-sewa/shared";
import type { WorkerFilters } from "../../hooks/useWorkers";
import { useIsMobile } from "../../hooks/useMediaQuery";

interface FilterPanelProps {
  filters: WorkerFilters;
  onChange: (f: WorkerFilters) => void;
  resultCount: number;
}

export default function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const selectedDistricts = filters.provinceId
    ? getDistrictsByProvince(filters.provinceId)
    : [];

  const update = (patch: Partial<WorkerFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clearAll = () => {
    onChange({});
  };

  const hasFilters =
    filters.provinceId ||
    filters.districtId ||
    filters.jobCategoryId ||
    (filters.search && filters.search.trim().length > 0) ||
    filters.isAvailable === true;

  return (
    <div className="filter-panel">
      {isMobile && (
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            paddingBottom: isOpen ? 16 : 0, 
            borderBottom: isOpen ? "1px solid var(--terrain-200)" : "none", 
            marginBottom: isOpen ? 16 : 0, 
            cursor: "pointer" 
          }}
        >
          <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{isOpen ? "🔽" : "▶️"}</span> 
            <span>Filters {hasFilters ? <span style={{ color: "var(--crimson-700)" }}>•</span> : ""}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {isOpen ? "Hide" : "Show"} filters
          </div>
        </div>
      )}

      {(!isMobile || isOpen) && (
        <>
          <div className="filter-grid">
        {/* Search */}
        <div>
          <label className="label">Search</label>
          <input
            className="input"
            type="text"
            placeholder="Search by name, skill, district..."
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>

        {/* Province */}
        <div>
          <label className="label">Province</label>
          <select
            className="select"
            value={filters.provinceId ?? ""}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : undefined;
              update({ provinceId: v, districtId: undefined });
            }}
          >
            <option value="">All Provinces</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.nameEn}</option>
            ))}
          </select>
        </div>

        {/* District (cascaded from Province) */}
        <div>
          <label className="label">District</label>
          <select
            className="select"
            value={filters.districtId ?? ""}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : undefined;
              update({ districtId: v });
            }}
            disabled={!filters.provinceId}
          >
            <option value="">
              {filters.provinceId ? "All Districts" : "Select province first"}
            </option>
            {selectedDistricts.map((d) => (
              <option key={d.id} value={d.id}>{d.nameEn}</option>
            ))}
          </select>
        </div>

        {/* Job Category */}
        <div>
          <label className="label">Job Type</label>
          <select
            className="select"
            value={filters.jobCategoryId ?? ""}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : undefined;
              update({ jobCategoryId: v });
            }}
          >
            <option value="">All Jobs</option>
            {jobCategories.map((j, i) => (
              <option key={j.slug} value={i + 1}>{j.icon} {j.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-footer">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.isAvailable === true}
            onChange={(e) => update({ isAvailable: e.target.checked ? true : undefined })}
          />
          Available only
        </label>

        {hasFilters && (
          <button className="btn btn-sm btn-outline" onClick={clearAll}>
            ✕ Clear Filters
          </button>
        )}

          <span className="filter-count">
            {resultCount} worker{resultCount !== 1 ? "s" : ""} found
          </span>
        </div>
        </>
      )}
    </div>
  );
}
