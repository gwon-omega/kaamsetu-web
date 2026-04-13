import { useState } from "react";
import { Loader2 } from "lucide-react";

const PLAY_STORE_URL =
  (import.meta as any).env?.PUBLIC_ANDROID_PLAY_STORE_URL ||
  (import.meta as any).env?.VITE_PLAY_STORE_URL ||
  (import.meta as any).env?.VITE_ANDROID_PLAY_STORE_URL ||
  "#";
const GOOGLE_DRIVE_URL =
  (import.meta as any).env?.PUBLIC_ANDROID_APK_DRIVE_URL ||
  (import.meta as any).env?.PUBLIC_ANDROID_APK_URL ||
  (import.meta as any).env?.VITE_ANDROID_APK_DRIVE_URL ||
  (import.meta as any).env?.VITE_GOOGLE_DRIVE_URL ||
  "#";

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const appDownloadUrl =
    GOOGLE_DRIVE_URL !== "#" ? GOOGLE_DRIVE_URL : PLAY_STORE_URL;

  const [downloadState, setDownloadState] = useState<
    "idle" | "loading" | "error"
  >("idle");

  const handleDownloadClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    if (downloadState === "loading") return;

    setDownloadState("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await fetch(appDownloadUrl, { mode: "no-cors" });

      const link = document.createElement("a");
      link.href = appDownloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setDownloadState("idle"), 2000);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadState("error");
    }
  };

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
            <p
              style={{
                marginTop: 8,
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              🇳🇵 Covering all 7 provinces, 77 districts, 753 local units
            </p>
          </div>
          <div className="footer-links">
            <a href="#about" onClick={(e) => handleLink(e, "about")}>
              About Us
            </a>
            <a href="#privacy" onClick={(e) => handleLink(e, "privacy")}>
              Privacy Policy
            </a>
            <a href="#terms" onClick={(e) => handleLink(e, "terms")}>
              Terms of Service
            </a>
            <a href="#contact" onClick={(e) => handleLink(e, "contact")}>
              Contact Support
            </a>
          </div>
          <div className="footer-downloads">
            <h4>Download App</h4>
            <div className="footer-download-actions">
              {downloadState === "idle" ? (
                <a
                  href={appDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleDownloadClick}
                  aria-label="Download App"
                  style={{
                    display: "inline-block",
                    transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseOut={(e) => (e.currentTarget.style.transform = "")}
                >
                  <img
                    src="/play_store_badge.png"
                    alt="Get it on Google Play"
                    style={{ height: 58, display: "block" }}
                  />
                </a>
              ) : (
                <div
                  style={{
                    height: 58,
                    width: 200,
                    backgroundColor: "rgba(28, 53, 87, 0.5)",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  {downloadState === "loading" ? (
                    <>
                      <Loader2
                        size={24}
                        color="#C9971C"
                        style={{
                          animation: "spin 1s linear infinite",
                          marginBottom: "4px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#FAF7F0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Preparing download...
                      </span>
                    </>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#f87171",
                          margin: "0 0 4px 0",
                          fontWeight: 500,
                        }}
                      >
                        Download failed.
                      </p>
                      <a
                        href={GOOGLE_DRIVE_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setDownloadState("idle")}
                        style={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#C9971C",
                          textDecoration: "none",
                        }}
                      >
                        Try Drive link -&gt;
                      </a>
                    </div>
                  )}
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Nepal Local Manpower Platform. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
