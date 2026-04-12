import { useAuth } from "../../hooks/useAuth";

interface BottomNavProps {
  view: string;
  onNavigate: (view: string) => void;
}

const TABS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "browse", icon: "🔍", label: "Search" },
  { id: "register", icon: "📝", label: "", fab: true },
  { id: "dashboard", icon: "📋", label: "Hires" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function BottomNav({ view, onNavigate }: BottomNavProps) {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        if ((tab.id === "dashboard" || tab.id === "profile") && !isAuthenticated) {
          return null;
        }
        
        if (tab.fab) {
          return (
            <div key={tab.id} className="nav-fab-wrap">
              <button
                className="nav-fab"
                onClick={() => onNavigate(tab.id)}
                aria-label="Register"
                aria-current={view === tab.id ? "page" : undefined}
              >
                <span className="nav-icon">{tab.icon}</span>
              </button>
            </div>
          );
        }
        return (
          <button
            key={tab.id}
            className={`nav-item ${view === tab.id ? "active" : ""}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={view === tab.id ? "page" : undefined}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
