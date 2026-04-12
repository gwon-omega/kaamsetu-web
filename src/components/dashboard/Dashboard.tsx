import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { getSupabaseSafe } from "../../lib/supabase";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: records, isLoading } = useQuery({
    queryKey: ["my-hires", user?.id, user?.role],
    queryFn: async () => {
      const supabase = getSupabaseSafe();
      if (!supabase || !user) return [];

      if (user.role === "worker") {
        const { data: profile } = await supabase.from("worker_profiles").select("id, total_hires, pending_hires, avg_rating").eq("user_id", user.id).single();
        if (!profile) return { profile: null, hires: [] };
        const workerId = (profile as any).id;
        
        const { data, error } = await supabase
          .from("hire_records")
          .select(`
            id, status, work_description, work_date, agreed_rate_npr, hired_at,
            hirer:users!hire_records_hirer_id_fkey(full_name, phone)
          `)
          .eq("worker_id", workerId)
          .order("hired_at", { ascending: false });
          
        if (error) throw error;
        return { profile, hires: data || [] };
      } else {
        const { data, error } = await supabase
          .from("hire_records")
          .select(`
            id, status, work_description, work_date, agreed_rate_npr, hired_at,
            worker:worker_profiles!hire_records_worker_id_fkey(daily_rate_npr, user:users!worker_profiles_user_id_fkey(full_name, phone))
          `)
          .eq("hirer_id", user.id)
          .order("hired_at", { ascending: false });
          
        if (error) throw error;
        return { profile: null, hires: data || [] };
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <span style={{ marginTop: 12 }}>Loading dashboard...</span>
      </div>
    );
  }

  const isWorker = user?.role === "worker";
  const hires = (records as any)?.hires || [];
  const profile = (records as any)?.profile;

  return (
    <div className="section">
      <div className="page-header">
        <h1 className="page-title">{isWorker ? "Worker Dashboard" : "My Hires"}</h1>
        <p className="page-desc">{isWorker ? "Manage your assignments and pending requests." : "Track the workers you have hired."}</p>
      </div>

      {isWorker && profile && (
        <div className="dash-grid" style={{ marginBottom: 32 }}>
          <div className="dash-card">
            <div className="dash-card-icon">✅</div>
            <div className="dash-card-val" style={{ color: "var(--green-500)" }}>{profile.total_hires}</div>
            <div className="dash-card-label">Total Hires</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">⏳</div>
            <div className="dash-card-val" style={{ color: "var(--crimson-700)" }}>{profile.pending_hires}</div>
            <div className="dash-card-label">Pending Requests</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">⭐</div>
            <div className="dash-card-val" style={{ color: "var(--gold-500)" }}>{profile.avg_rating > 0 ? profile.avg_rating : "—"}</div>
            <div className="dash-card-label">Avg Rating</div>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <div className="table-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Activity</h3>
        </div>
        {hires.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-icon">📋</div>
            <div className="empty-desc">No records found.</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{isWorker ? "Hirer" : "Worker"}</th>
                  <th>Date</th>
                  <th>Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hires.map((h: any) => {
                  const personName = isWorker 
                    ? h.hirer?.full_name 
                    : h.worker?.user?.full_name;
                  
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{personName || "Unknown"}</td>
                      <td>{new Date(h.hired_at).toLocaleDateString()}</td>
                      <td>Rs. {h.agreed_rate_npr || h.worker?.daily_rate_npr || "—"}</td>
                      <td>
                        <span className={`badge ${h.status === "completed" ? "badge-green" : h.status === "pending" ? "badge-gray" : ""}`}>
                          {h.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
