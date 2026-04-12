import { useAuth } from "../../hooks/useAuth";

interface HeroSectionProps {
  onFindWorkers: () => void;
  onRegister: () => void;
  onGoToDashboard: () => void;
}

export default function HeroSection({ onFindWorkers, onRegister, onGoToDashboard }: HeroSectionProps) {
  const { user } = useAuth();
  const isWorker = user?.role === "worker";

  return (
    <section className="hero">
      <img src="/hero-bg.png" alt="" className="hero-bg-image" loading="eager" />
      <div className="hero-overlay" />
      <div className="hero-radials" />

      <div className="hero-content">
        <div className="hero-badge">
          🇳🇵 &nbsp;Official Local Government Platform
        </div>

        <h1 className="np">
          सही काम,<br />
          <span className="gold">सही मान्छे</span>
        </h1>

        <p className="hero-desc">
          Connect with verified skilled workers across all 7 provinces and 77 districts of Nepal.
          Fast, transparent, one-click hiring.
        </p>

        <div className="hero-actions">
          <button className="btn btn-gold" onClick={onFindWorkers}>
            🔍 Find Workers
          </button>
          {isWorker ? (
            <button className="btn btn-outline-light" onClick={onGoToDashboard}>
              📊 Go to Dashboard
            </button>
          ) : (
            <button className="btn btn-outline-light" onClick={onRegister}>
              📝 Register as Worker
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
