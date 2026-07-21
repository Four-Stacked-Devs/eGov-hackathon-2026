import { Logo } from "./Logo";

function Bar({ w, h = 12, style }: { w: number | string; h?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, ...style }} />;
}

function StationSkeleton() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
      <div className="skeleton" style={{ width: 30, height: 30, borderRadius: "50%", flex: "0 0 auto" }} />
      <div style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 11, padding: "12px", background: "#fff" }}>
        <Bar w={64} h={9} style={{ marginBottom: 8 }} />
        <Bar w="70%" h={13} style={{ marginBottom: 8 }} />
        <Bar w="45%" h={10} />
      </div>
    </div>
  );
}

/** Full-workspace skeleton shown while /me and /roadmap load. */
export function WorkspaceSkeleton() {
  return (
    <div className="haviflow" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line)", background: "#fff", flex: "0 0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
          <Logo />
          <div className="skeleton" style={{ width: 180, height: 32, borderRadius: 999 }} />
        </div>
      </header>

      <div className="split">
        <aside className="route-pane" style={{ padding: "18px 18px 24px" }}>
          <Bar w={80} h={10} style={{ marginBottom: 10 }} />
          <Bar w="80%" h={16} style={{ marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 6, borderRadius: 999, marginBottom: 10 }} />
          <Bar w="90%" h={10} style={{ marginBottom: 18 }} />
          {[...Array(6)].map((_, i) => (
            <StationSkeleton key={i} />
          ))}
        </aside>

        <section className="chat-pane">
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: "50%", flex: "0 0 auto" }} />
                <div className="skeleton" style={{ width: "72%", height: 74, borderRadius: 14, borderTopLeftRadius: 4 }} />
              </div>
              <div className="skeleton" style={{ alignSelf: "flex-end", width: "38%", height: 40, borderRadius: 14, borderTopRightRadius: 4 }} />
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: "50%", flex: "0 0 auto" }} />
                <div className="skeleton" style={{ width: "56%", height: 54, borderRadius: 14, borderTopLeftRadius: 4 }} />
              </div>
            </div>
          </div>
          <div style={{ flex: "0 0 auto", borderTop: "1px solid var(--line)", background: "#fff" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "10px 20px 14px" }}>
              <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
                {[130, 170, 140].map((w, i) => (
                  <div className="skeleton" key={i} style={{ width: w, height: 30, borderRadius: 999 }} />
                ))}
              </div>
              <div className="skeleton" style={{ height: 44, borderRadius: 12 }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
