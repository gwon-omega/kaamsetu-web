import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface HeaderProps {
  view: string;
  onNavigate: (view: string) => void;
}

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "browse", label: "Find Workers" },
  { id: "dashboard", label: "Dashboard" },
];

export default function Header({ view, onNavigate }: HeaderProps) {
  const { isAuthenticated, user, setShowAuthModal, signOut } = useAuth();
  const [lang, setLang] = useState<"EN" | "NP">("EN");

  const toggleLang = () => setLang((prev) => (prev === "EN" ? "NP" : "EN"));

  return (
    <header className="header">
      <div className="header-inner">
        <button
          type="button"
          className="header-brand"
          onClick={() => onNavigate("home")}
          aria-label="Go to Home"
        >
          <div className="header-logo">⛰</div>
          <div>
            <div className="header-title np">श्रम सेवा</div>
            <div className="header-subtitle">Nepal Manpower Portal</div>
          </div>
        </button>

        <nav className="header-nav">
          {NAV_ITEMS.map((item) => {
            if (item.id === "dashboard" && !isAuthenticated) return null;
            return (
              <button
                key={item.id}
                className={`header-nav-btn ${view === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
                aria-current={view === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="header-actions">
          <button
            className="lang-toggle"
            onClick={toggleLang}
            aria-label="Toggle language"
          >
            <span className={lang === "EN" ? "lang-active" : ""}>EN</span>
            <span className="lang-sep">/</span>
            <span className={lang === "NP" ? "lang-active" : ""}>NP</span>
          </button>

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="header-user-btn"
                onClick={() => onNavigate("dashboard")}
                title={user?.fullName || user?.phone || "Profile"}
                aria-label="Open dashboard"
              >
                {(user?.fullName?.[0] || user?.phone?.[0] || "U").toUpperCase()}
              </button>
              <button
                className="header-login-btn"
                onClick={signOut}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button className="header-login-btn" onClick={() => setShowAuthModal(true)}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
