const PLAY_STORE_URL =
  (import.meta as any).env?.VITE_PLAY_STORE_URL ||
  (import.meta as any).env?.VITE_ANDROID_PLAY_STORE_URL ||
  "#";
const GOOGLE_DRIVE_URL =
  (import.meta as any).env?.VITE_ANDROID_APK_DRIVE_URL ||
  (import.meta as any).env?.VITE_GOOGLE_DRIVE_URL ||
  "#";

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="np">श्रम सेवा</h3>
            <p>Nepal Local Government Manpower Registry</p>
            <p style={{ marginTop: 8, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
              🇳🇵 Covering all 7 provinces, 77 districts, 753 local units
            </p>
          </div>
          <div className="footer-links">
            <a href="#about" onClick={(e) => handleLink(e, "about")}>About Us</a>
            <a href="#privacy" onClick={(e) => handleLink(e, "privacy")}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => handleLink(e, "terms")}>Terms of Service</a>
            <a href="#contact" onClick={(e) => handleLink(e, "contact")}>Contact Support</a>
          </div>
          <div className="footer-downloads">
            <h4>Download App</h4>
            <div className="footer-download-actions">
              <a
                href={GOOGLE_DRIVE_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Download App"
                style={{ display: "inline-block", transition: "transform 0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "")}
              >
                <img src="/play_store_badge.png" alt="Get it on Google Play" style={{ height: 44, display: "block" }} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Nepal Local Manpower Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
