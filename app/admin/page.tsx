import { getSupabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Triunfo Home Design" };

interface EventRow {
  id: number;
  event_id: string;
  event_name: string;
  provider: string;
  session_id: string | null;
  transaction_id: string | null;
  payload_sent: unknown;
  response_body: unknown;
  response_status: number | null;
  success: boolean | null;
  error_message: string | null;
  attempt: number;
  created_at: string;
}

async function getEvents() {
  const sb = getSupabase();
  if (!sb) return { events: [], stats: null };
  const { data } = await sb
    .from("tracking_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const events = (data as EventRow[]) || [];
  const total = events.length;
  const byName: Record<string, number> = {};
  const bySuccess: Record<string, number> = { success: 0, failed: 0, unknown: 0 };
  for (const e of events) {
    byName[e.event_name] = (byName[e.event_name] || 0) + 1;
    if (e.success === true) bySuccess.success++;
    else if (e.success === false) bySuccess.failed++;
    else bySuccess.unknown++;
  }
  return { events, stats: { total, byName, bySuccess } };
}

export default async function AdminPage() {
  const { events, stats } = await getEvents();
  if (!stats) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h1>Admin</h1>
      <p style={{ color: "#71686a" }}>Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.</p>
    </div>
  );
  return (
    <div style={{ padding: "24px 16px", maxWidth: 1100, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: "#201a1b" }}>📊 Eventos Meta</h1>
      <p style={{ fontSize: 13, color: "#71686a", margin: "0 0 24px" }}>Eventos de tracking enviados para o Facebook Ads</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "#f8efec", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#71686a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#011843" }}>{stats.total}</div>
        </div>
        <div style={{ background: "#edf8f4", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#71686a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Sucesso</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#167555" }}>{stats.bySuccess.success}</div>
        </div>
        <div style={{ background: "#fdeef0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#71686a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Falha</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#bd2c3b" }}>{stats.bySuccess.failed}</div>
        </div>
        <div style={{ background: "#f5f5f5", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#71686a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Desconhecido</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#71686a" }}>{stats.bySuccess.unknown}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {Object.entries(stats.byName).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
          <span key={name} style={{ background: "#011843", color: "#fff", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 700 }}>
            {name}: {count}
          </span>
        ))}
      </div>
      <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e9dfe0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#faf8f7", borderBottom: "1px solid #e9dfe0" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>Data</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>Evento</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>Status</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>HTTP</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>Event ID</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>Sessão</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#201a1b", whiteSpace: "nowrap" }}>Transação</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #e9dfe0" }}>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap", color: "#71686a" }}>
                  {new Date(e.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={{ padding: "10px 14px", fontWeight: 700, whiteSpace: "nowrap", color: "#201a1b" }}>
                  {e.event_name}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {e.success === true && <span style={{ color: "#167555", fontWeight: 700 }}>✅ Sucesso</span>}
                  {e.success === false && <span style={{ color: "#bd2c3b", fontWeight: 700 }}>❌ Falha</span>}
                  {e.success === null && <span style={{ color: "#71686a" }}>—</span>}
                </td>
                <td style={{ padding: "10px 14px", color: "#71686a", fontFamily: "monospace" }}>
                  {e.response_status || "—"}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#71686a" }}>
                  {e.event_id}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#71686a" }}>
                  {e.session_id || "—"}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#71686a" }}>
                  {e.transaction_id || "—"}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "40px 14px", textAlign: "center", color: "#71686a" }}>
                  Nenhum evento encontrado. Os eventos aparecerão aqui conforme forem enviados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#71686a", marginTop: 16, textAlign: "center" }}>
        Últimos {events.length} eventos · <a href="/" style={{ color: "#011843", fontWeight: 700 }}>← Voltar ao início</a>
      </p>
    </div>
  );
}
