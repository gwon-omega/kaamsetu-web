import { useState, useEffect } from "react";
import {
  provinces,
  getDistrictsByProvince,
  jobCategories,
} from "@shram-sewa/shared";
import { useAuth } from "../../hooks/useAuth";
import { getSupabaseSafe } from "../../lib/supabase";
import { showToast } from "../ui/Toast";

type Step = 1 | 2 | 3 | 4; // 4 = success

export default function RegisterForm() {
  const { isAuthenticated, user, setShowAuthModal } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [localUnitId, setLocalUnitId] = useState<number | "">("");
  const [localUnits, setLocalUnits] = useState<
    { id: number; name_en: string; unit_type: string }[]
  >([]);
  const [wardNo, setWardNo] = useState<number | "">("");
  const [jobCategoryIdx, setJobCategoryIdx] = useState<number | "">("");
  const [experienceYrs, setExperienceYrs] = useState<number | "">("");
  const [dailyRate, setDailyRate] = useState<number | "">("");
  const [about, setAbout] = useState("");

  const districts = provinceId
    ? getDistrictsByProvince(provinceId as number)
    : [];

  // Fetch local units dynamically based on district
  useEffect(() => {
    async function fetchLocalUnits() {
      if (!districtId) {
        setLocalUnits([]);
        setLocalUnitId("");
        return;
      }

      const supabase = getSupabaseSafe();
      if (!supabase) return;

      const { data } = await supabase
        .from("local_units")
        .select("id, name_en, unit_type")
        .eq("district_id", districtId)
        .order("name_en");

      if (data) {
        setLocalUnits(data);
      }
    }
    fetchLocalUnits();
  }, [districtId]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      showToast("Please sign in first to register", "error");
      return;
    }

    if (
      !fullName ||
      !provinceId ||
      !districtId ||
      !localUnitId ||
      !wardNo ||
      jobCategoryIdx === ""
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (dailyRate !== "" && Number(dailyRate) < 100) {
      showToast("Daily rate seems too low. Must be at least 100", "error");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseSafe();
      if (!supabase) throw new Error("Database not connected");

      // Update user profile name
      const { error: nameError } = await supabase.from("users").upsert(
        {
          id: user!.id,
          full_name: fullName,
          phone: phone || user?.phone || null,
          role: "worker",
        } as any,
        { onConflict: "id" },
      );

      if (nameError) console.warn("User upsert warning:", nameError.message);

      // Create worker profile
      const { error } = await supabase.from("worker_profiles").insert({
        user_id: user!.id,
        province_id: provinceId as number,
        district_id: districtId as number,
        local_unit_id: localUnitId as number,
        ward_no: wardNo as number,
        job_category_id: (jobCategoryIdx as number) + 1,
        experience_yrs: (experienceYrs as number) || 0,
        daily_rate_npr: (dailyRate as number) || null,
        about: about || null,
        is_available: true,
        is_approved: false,
      } as any);

      if (error) throw error;
      setStep(4);
      showToast("Registration submitted for review!");
    } catch (err: any) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="register-container">
        <div className="card">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h2 style={{ marginBottom: 8 }}>Registration Submitted!</h2>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: 24,
                maxWidth: 380,
                margin: "0 auto 24px",
              }}
            >
              Your worker profile for <strong>{fullName}</strong> has been
              submitted. An admin will review and approve it shortly.
            </p>
            <div className="form-summary">
              <div>
                👷{" "}
                {jobCategoryIdx !== ""
                  ? jobCategories[jobCategoryIdx as number]?.nameEn
                  : ""}
              </div>
              <div>
                📍 Ward {wardNo},{" "}
                {districts.find((d) => d.id === districtId)?.nameEn}
              </div>
              <div>⛰️ {provinces.find((p) => p.id === provinceId)?.nameEn}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepInfo = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Location" },
    { num: 3, label: "Work" },
  ];

  return (
    <div className="register-container">
      <div className="page-header">
        <h1 className="page-title">Register as Worker</h1>
        <p className="page-desc">
          Join Nepal's official manpower registry. Your profile will be visible
          to employers across the country.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="warning-box" style={{ marginBottom: 16 }}>
          ⚠️ You need to{" "}
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--crimson-700)",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => setShowAuthModal(true)}
          >
            sign in
          </button>{" "}
          before registering.
        </div>
      )}

      <div className="card">
        {/* Step indicators */}
        <div className="register-steps">
          {stepInfo.map((s) => (
            <div
              key={s.num}
              className={`register-step ${step === s.num ? "current" : step > s.num ? "done" : "pending"}`}
            >
              <div className="step-num">{step > s.num ? "✓" : s.num}</div>
              <div className="step-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="register-body">
          {/* STEP 1: Personal */}
          {step === 1 && (
            <div>
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input
                  className="input"
                  placeholder="Ram Bahadur Tamang"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="form-row">
                <div />
                <button
                  className="btn btn-crimson"
                  onClick={() => {
                    if (!fullName) {
                      showToast("Name is required", "error");
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div>
              <div className="form-group">
                <label className="label">Province *</label>
                <select
                  className="select"
                  value={provinceId}
                  onChange={(e) => {
                    setProvinceId(e.target.value ? Number(e.target.value) : "");
                    setDistrictId("");
                  }}
                >
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} ({p.nameNp})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">District *</label>
                <select
                  className="select"
                  value={districtId}
                  onChange={(e) =>
                    setDistrictId(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={!provinceId}
                >
                  <option value="">
                    {provinceId ? "Select District" : "Select province first"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Local Unit / Municipality *</label>
                <select
                  className="select"
                  value={localUnitId}
                  onChange={(e) =>
                    setLocalUnitId(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={!districtId || localUnits.length === 0}
                >
                  <option value="">
                    {!districtId
                      ? "Select district first"
                      : localUnits.length === 0
                        ? "Loading units..."
                        : "Select Local Unit"}
                  </option>
                  {localUnits.map((lu) => (
                    <option key={lu.id} value={lu.id}>
                      {lu.name_en} ({lu.unit_type.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Ward Number *</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="35"
                  placeholder="1-35"
                  value={wardNo}
                  onChange={(e) =>
                    setWardNo(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
              <div className="form-row">
                <button className="btn btn-outline" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  className="btn btn-crimson"
                  onClick={() => {
                    if (!provinceId || !districtId || !localUnitId || !wardNo) {
                      showToast("Fill all location fields", "error");
                      return;
                    }
                    setStep(3);
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Work Details */}
          {step === 3 && (
            <div>
              <div className="form-group">
                <label className="label">Job Category *</label>
                <select
                  className="select"
                  value={jobCategoryIdx}
                  onChange={(e) =>
                    setJobCategoryIdx(
                      e.target.value !== "" ? Number(e.target.value) : "",
                    )
                  }
                >
                  <option value="">Select Job Type</option>
                  {jobCategories.map((j, i) => (
                    <option key={j.slug} value={i}>
                      {j.icon} {j.nameEn} ({j.nameNp})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Years of Experience</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 5"
                  value={experienceYrs}
                  onChange={(e) =>
                    setExperienceYrs(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">Daily Rate (NPR)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="e.g. 800"
                  value={dailyRate}
                  onChange={(e) =>
                    setDailyRate(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">About You</label>
                <textarea
                  className="input"
                  placeholder="Brief description of your skills and experience..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="form-summary">
                <strong>Summary:</strong>
                <br />
                👤 {fullName}
                <br />
                📍 Ward {wardNo},{" "}
                {districts.find((d) => d.id === districtId)?.nameEn},{" "}
                {provinces.find((p) => p.id === provinceId)?.nameEn}
                <br />
                👷{" "}
                {jobCategoryIdx !== ""
                  ? jobCategories[jobCategoryIdx as number]?.nameEn
                  : "Not selected"}
              </div>

              <div className="form-row">
                <button className="btn btn-outline" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button
                  className="btn btn-crimson"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      className="spinner"
                      style={{ width: 18, height: 18, borderWidth: 2 }}
                    />
                  ) : (
                    "✓ Submit Registration"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
