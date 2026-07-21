import { Logo } from "./Logo";

/** Chat-first workspace skeleton shown while /me and /roadmap load. */
export function WorkspaceSkeleton() {
  return (
    <div className="haviflow" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line)", background: "#fff", flex: "0 0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
          <Logo />
          <div className="skeleton" style={{ width: 180, height: 32, borderRadius: 999 }} />
        </div>
      </header>

      <div className="chat-only">
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
