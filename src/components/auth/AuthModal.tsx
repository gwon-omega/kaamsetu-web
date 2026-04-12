import { useId, useState, useRef } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../ui/Toast";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signInWithOtp, verifyOtp, signInWithPassword, signUp } = useAuth();
  const titleId = useId();
  const [tab, setTab] = useState<"otp" | "email">("otp");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetState = () => {
    setPhone(""); setOtpSent(false); setOtp(["","","","","",""]); setEmail(""); setPassword(""); setFullName(""); setLoading(false); setIsSignUp(false);
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetState();
  };

  const handleRequestOtp = async () => {
    if (phone.length !== 10 || !phone.startsWith("98")) {
      showToast("Enter valid 10-digit phone (98XXXXXXXX)", "error");
      return;
    }
    setLoading(true);
    const res = await signInWithOtp(phone);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      showToast("OTP sent to your phone");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      showToast(res.error || "Failed to send OTP", "error");
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      showToast("Enter all 6 digits", "error");
      return;
    }
    setLoading(true);
    const res = await verifyOtp(phone, code);
    setLoading(false);
    if (res.success) {
      showToast("Signed in successfully!");
      handleClose();
    } else {
      showToast(res.error || "Invalid OTP", "error");
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      showToast("Email and password required", "error");
      return;
    }
    if (isSignUp && !fullName.trim()) {
      showToast("Full Name is required for registration", "error");
      return;
    }
    
    setLoading(true);
    let res;
    if (isSignUp) {
      res = await signUp(email, password, { full_name: fullName.trim() });
    } else {
      res = await signInWithPassword(email, password);
    }
    
    setLoading(false);
    if (res.success) {
      showToast(isSignUp ? "Account created! Check your email." : "Signed in successfully!");
      if (!isSignUp) handleClose();
    } else {
      showToast(res.error || "Authentication failed", "error");
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    if (val && !/^\d$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <Modal open={showAuthModal} onClose={handleClose} titleId={titleId}>
      {/* Header */}
      <div className="modal-hero">
        <div style={{ fontSize: 40, marginBottom: 8 }}>⛰️</div>
        <h2 id={titleId} style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          श्रम सेवा
        </h2>
        <p style={{ fontSize: 13, opacity: 0.8 }}>Sign in to hire workers or register</p>
      </div>

      {/* Tabs */}
      <div className="auth-tabs">
        <button className={`auth-tab ${tab === "otp" ? "active" : ""}`} onClick={() => { setTab("otp"); resetState(); }}>
          📱 Phone OTP
        </button>
        <button className={`auth-tab ${tab === "email" ? "active" : ""}`} onClick={() => { setTab("email"); resetState(); }}>
          ✉️ Email
        </button>
      </div>

      <div className="auth-body">
        {/* ── OTP TAB ── */}
        {tab === "otp" && !otpSent && (
          <div>
            <label className="label">Phone Number</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                padding: "11px 12px", background: "var(--terrain-100)", borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--terrain-200)", fontSize: 14, fontWeight: 600, color: "var(--text-muted)", flexShrink: 0
              }}>
                🇳🇵 +977
              </div>
              <input
                className="input"
                type="tel"
                placeholder="98XXXXXXXX"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              We'll send a 6-digit verification code via SMS
            </p>
            <button
              className="btn btn-crimson btn-block"
              style={{ marginTop: 16 }}
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Send OTP →"}
            </button>
          </div>
        )}

        {tab === "otp" && otpSent && (
          <div>
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
              Enter the code sent to
            </p>
            <p style={{ textAlign: "center", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              +977 {phone}
            </p>
            <div className="otp-input-group">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className="otp-digit"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>
            <button
              className="btn btn-crimson btn-block"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "✓ Verify & Sign In"}
            </button>
            <button
              className="btn btn-outline btn-block"
              style={{ marginTop: 8 }}
              onClick={() => { setOtpSent(false); setOtp(["","","","","",""]); }}
            >
              ← Change Number
            </button>
          </div>
        )}

        {/* ── EMAIL TAB ── */}
        {tab === "email" && (
          <div className="fade-in">
            {isSignUp && (
              <div className="form-group slide-in">
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="Ram Bahadur" value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
              </div>
            )}
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus={!isSignUp} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button
              className="btn btn-crimson btn-block"
              onClick={handleEmailAuth}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : isSignUp ? "Create Account" : "Sign In"}
            </button>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                style={{ background: "none", border: "none", color: "var(--crimson-700)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
