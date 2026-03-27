import { useState, useMemo } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { ArrowLeft } from "lucide-react";
import Button from "../components/Button";

// ─── Fraud maps ──────────────────────────────────────────────────────────────
const RING_PALETTE = [
  { node: "#dc2626", stroke: "#fca5a5", label: "#fca5a5" },
  { node: "#ea580c", stroke: "#fdba74", label: "#fdba74" },
  { node: "#7c3aed", stroke: "#c4b5fd", label: "#c4b5fd" },
  { node: "#0891b2", stroke: "#67e8f9", label: "#67e8f9" },
  { node: "#be185d", stroke: "#f9a8d4", label: "#f9a8d4" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShowDetailsPage({ selectedIds = new Set(), onNavigate }) {
  const { nodes, edges, fileName, fraudData } = useTransactions();

  const [activeTab,     setActiveTab]     = useState("summary");
  const [filterAccount, setFilterAccount] = useState("all");
  const [sortKey,       setSortKey]       = useState("date");
  const [sortDir,       setSortDir]       = useState("desc");
  const [ringSort,      setRingSort]      = useState("risk_score");

  const hasSelection = selectedIds.size > 0;

  // Download JSON function
  const downloadJSON = () => {
    if (!fraudData) {
      alert('No fraud analysis data available to download');
      return;
    }
    const dataStr = JSON.stringify(fraudData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fraud-analysis-${fileName || 'results'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build fraud maps from backend data
  const { ringColorMap, suspiciousMap, accountRingMap } = useMemo(() => {
    const ringColorMap   = {};
    const suspiciousMap  = {};
    const accountRingMap = {};
    
    if (fraudData) {
      fraudData.fraud_rings?.forEach((ring, i) => {
        ringColorMap[ring.ring_id] = RING_PALETTE[i % RING_PALETTE.length];
        ring.member_accounts.forEach(id => { accountRingMap[id] = ring; });
      });
      fraudData.suspicious_accounts?.forEach(a => { suspiciousMap[a.account_id] = a; });
    }
    
    return { ringColorMap, suspiciousMap, accountRingMap };
  }, [fraudData]);

  function getNodeColor(id) {
    const ring = accountRingMap[id];
    const susp = suspiciousMap[id];
    if (ring) return ringColorMap[ring.ring_id].node;
    if (susp) return "#ef4444"; // brighter red for dark mode
    return "#22c55e"; // brighter green for dark mode
  }

  // Accounts to show in summary (selected, or all)
  const accountIds = hasSelection ? [...selectedIds] : nodes.map(n => n.id);

  // Per-account summary data
  const summaries = useMemo(() => accountIds.map(id => {
    const sent     = edges.filter(e => e.source === id);
    const received = edges.filter(e => e.target === id);
    return {
      id,
      sentCount:     sent.length,
      receivedCount: received.length,
      totalSent:     sent.reduce((s, e) => s + e.amount, 0),
      totalReceived: received.reduce((s, e) => s + e.amount, 0),
      sentTo:        [...new Set(sent.map(e => e.target))],
      receivedFrom:  [...new Set(received.map(e => e.source))],
      suspicious:    suspiciousMap[id],
      ring:          accountRingMap[id],
    };
  }), [accountIds, edges]);

  // Transactions to show in table
  const visibleEdges = useMemo(() => {
    let result = edges.filter(e => {
      const inSelection = !hasSelection || selectedIds.has(e.source) || selectedIds.has(e.target);
      const inFilter    = filterAccount === "all" || e.source === filterAccount || e.target === filterAccount;
      return inSelection && inFilter;
    });
    result = [...result].sort((a, b) => {
      let av, bv;
      if      (sortKey === "amount")   { av = a.amount;    bv = b.amount; }
      else if (sortKey === "sender")   { av = a.source;    bv = b.source; }
      else if (sortKey === "receiver") { av = a.target;    bv = b.target; }
      else                             { av = a.timestamp; bv = b.timestamp; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [edges, selectedIds, filterAccount, sortKey, sortDir]);

  const totalAmount = visibleEdges.reduce((s, e) => s + e.amount, 0);

  // Sorted fraud rings
  const sortedRings = useMemo(() => {
    if (!fraudData?.fraud_rings) return [];
    const rings = [...fraudData.fraud_rings];
    rings.sort((a, b) => {
      if (ringSort === "risk_score") return b.risk_score - a.risk_score;
      if (ringSort === "member_count") return b.member_accounts.length - a.member_accounts.length;
      if (ringSort === "ring_id") return a.ring_id.localeCompare(b.ring_id);
      return 0;
    });
    return rings;
  }, [fraudData, ringSort]);

  function handleSortClick(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function handleCardClick(id) {
    if (filterAccount === id) {
      setFilterAccount("all");
    } else {
      setFilterAccount(id);
      setActiveTab("transactions");
    }
  }

  const sortArrow = (key) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#05050a", fontFamily: "system-ui, -apple-system, sans-serif", color: "#fff", position: "relative" }}>
      {/* ── PEAK UI BACKGROUND ELEMENTS ── */}
      <style>{`
        html, body, #root { margin: 0; padding: 0; background: #05050a; width: 100%; height: 100%; overflow: hidden; }
        @keyframes orbDrift1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15vw, 15vh) scale(1.1); }
          66% { transform: translate(-10vw, 20vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes orbDrift2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-20vw, -10vh) scale(1.2); }
          66% { transform: translate(15vw, -25vh) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .cinematic-grain {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E');
          opacity: 0.05; mix-blend-mode: color-dodge; pointer-events: none; z-index: 1;
        }
        .peak-glass-btn {
          position: relative; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px); color: rgba(255, 255, 255, 0.9); font-weight: 500;
          padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05); font-size: 11px; text-transform: uppercase;
        }
        .peak-glass-btn:hover {
          background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2); color: #fff;
        }
      `}</style>
      <div style={{ position: "absolute", top: "20%", left: "30%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(147,51,234,0.1) 0%, rgba(0,0,0,0) 70%)", animation: "orbDrift1 25s ease-in-out infinite alternate", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%)", animation: "orbDrift2 30s ease-in-out infinite alternate", pointerEvents: "none", zIndex: 0 }} />
      <div className="cinematic-grain" />

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{ height: 60, flexShrink: 0, background: "rgba(10, 10, 12, 0.6)", backdropFilter: "blur(24px) saturate(180%)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", zIndex: 10, boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", cursor: "pointer", marginRight: "8px", color: "rgba(255,255,255,0.7)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="white"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.7)"}>
             <ArrowLeft size={24} />
          </div>
          <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff", boxShadow: "0 0 15px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.6)", textShadow: "0 0 10px rgba(255,255,255,0.6)" }}>D</div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "0.25em", textTransform: "uppercase", background: "linear-gradient(to bottom, #ffffff 30%, #555555 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))", marginLeft: 8 }}>DOOMSDAY</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 8px" }}>|</span>
          <span style={{ fontWeight: 500, fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)" }}>DATA LOGS</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {fraudData && <button className="peak-glass-btn" onClick={downloadJSON}>Download JSON</button>}
          <button className="peak-glass-btn" onClick={() => onNavigate("graph")}>View Graph</button>
          <button className="peak-glass-btn" onClick={() => onNavigate("addfile")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}>Add File</button>
        </div>
      </header>

      {/* ── TAB BAR ── */}
      <div style={{ zIndex: 5, flexShrink: 0, background: "rgba(20, 20, 25, 0.4)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "stretch", padding: "0 30px", gap: 4 }}>
        {[
          { key: "summary",      label: "ACCOUNT SUMMARY",  count: accountIds.length },
          { key: "rings",        label: "FRAUD RINGS",      count: fraudData?.fraud_rings?.length || 0 },
          { key: "transactions", label: "TRANSACTIONS",     count: visibleEdges.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background:    "none",
              border:        "none",
              borderBottom:  activeTab === tab.key ? "3px solid #67e8f9" : "3px solid transparent",
              padding:       "16px 20px 14px",
              cursor:        "pointer",
              fontSize:      11,
              fontWeight:    activeTab === tab.key ? 800 : 500,
              color:         activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              display:       "flex",
              alignItems:    "center",
              gap:           10,
              transition:    "all 0.2s",
              marginBottom:  -1,
            }}
          >
            {tab.label}
            <span style={{ fontSize: 9, background: activeTab === tab.key ? "rgba(103, 232, 249, 0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${activeTab === tab.key ? "rgba(103, 232, 249, 0.5)" : "transparent"}`, color: activeTab === tab.key ? "#67e8f9" : "rgba(255,255,255,0.4)", borderRadius: 10, padding: "2px 8px", fontWeight: 700 }}>
              {tab.count}
            </span>
          </button>
        ))}

        {filterAccount !== "all" && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>FILTERED BY:</span>
            <div style={{ background: getNodeColor(filterAccount) + "33", border: `1px solid ${getNodeColor(filterAccount)}`, borderRadius: 12, padding: "4px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>{filterAccount}</span>
              <button onClick={() => setFilterAccount("all")} style={{ background: "transparent", border: "none", color: "white", width: 14, height: 14, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, opacity: 0.6 }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", zIndex: 10 }}>

        {/* ══ SUMMARY TAB ══════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, opacity: activeTab === "summary" ? 1 : 0, pointerEvents: activeTab === "summary" ? "auto" : "none", transform: activeTab === "summary" ? "translateX(0)" : "translateX(-18px)", transition: "opacity 0.2s ease, transform 0.2s ease", overflow: "auto", padding: "30px", paddingTop: 40}}>
          {summaries.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No accounts to display.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {summaries.map(s => {
              const nodeColor  = getNodeColor(s.id);
              const isFiltered = filterAccount === s.id;
              const isSusp     = !!s.suspicious;
              const ringData   = s.ring;

              return (
                <div key={s.id} onClick={() => handleCardClick(s.id)}
                  style={{
                    border: `1px solid ${isFiltered ? nodeColor : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 16,
                    background: isFiltered ? nodeColor + "15" : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(20px)",
                    cursor: "pointer", transition: "all 0.2s", overflow: "hidden",
                    boxShadow: isFiltered ? `0 0 20px ${nodeColor}33` : "none",
                  }}
                  onMouseEnter={e => { if (!isFiltered) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (!isFiltered) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <div style={{ background: `linear-gradient(90deg, ${nodeColor}33, transparent)`, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 9, color: nodeColor, letterSpacing: "0.15em", marginBottom: 6, fontWeight: 700 }}>
                        {ringData ? `${ringData.ring_id} · ${ringData.pattern_type.replace(/_/g, ' ')}` : isSusp ? "SUSPICIOUS" : "ACCOUNT"}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "white", wordBreak: "break-all", fontFamily: "monospace" }}>{s.id}</p>
                    </div>
                    {isSusp && (
                      <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${nodeColor}55`, borderRadius: 8, padding: "6px 10px", flexShrink: 0, marginLeft: 10 }}>
                        <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>SCORE</p>
                        <p style={{ fontSize: 14, fontWeight: 900, color: nodeColor }}>{s.suspicious.suspicion_score}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ padding: "14px 18px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>SENT</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: "white", lineHeight: 1 }}>{s.sentCount}<span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>tx</span></p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginTop: 6 }}>₹{s.totalSent.toLocaleString("en-IN")}</p>
                    </div>
                    <div style={{ padding: "14px 18px" }}>
                      <p style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>RECEIVED</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: "white", lineHeight: 1 }}>{s.receivedCount}<span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>tx</span></p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginTop: 6 }}>₹{s.totalReceived.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ FRAUD RINGS TAB ══════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, opacity: activeTab === "rings" ? 1 : 0, pointerEvents: activeTab === "rings" ? "auto" : "none", transform: activeTab === "rings" ? "translateX(0)" : "translateX(-18px)", transition: "opacity 0.2s ease, transform 0.2s ease", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>
            {sortedRings.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No rings detected in current dataset.</div>}
            {sortedRings.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 180px 100px 110px 1fr", gap: "0 16px", padding: "16px 24px", background: "rgba(0,0,0,0.3)", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <span>RING ID</span><span>PATTERN TYPE</span><span style={{ textAlign: "center" }}>MEMBERS</span><span style={{ textAlign: "right" }}>RISK SCORE</span><span>ACCOUNT IDs</span>
                </div>
                {sortedRings.map((ring, i) => {
                  const ringColor = ringColorMap[ring.ring_id] || RING_PALETTE[0];
                  return (
                    <div key={ring.ring_id} style={{ display: "grid", gridTemplateColumns: "120px 180px 100px 110px 1fr", gap: "0 16px", padding: "20px 24px", borderBottom: i < sortedRings.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center", transition: "background 0.2s" }} onMouseEnter={el => el.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={el => el.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: ringColor.node, boxShadow: `0 0 10px ${ringColor.node}` }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: ringColor.node, fontFamily: "monospace" }}>{ring.ring_id}</span>
                      </div>
                      <div style={{ background: ringColor.node + "20", border: `1px solid ${ringColor.node}40`, borderRadius: 8, padding: "6px 12px", display: "inline-block" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: ringColor.node, textTransform: "uppercase", letterSpacing: "0.1em" }}>{ring.pattern_type.replace(/_/g, " ")}</span>
                      </div>
                      <div style={{ textAlign: "center" }}><span style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{ring.member_accounts.length}</span></div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-block", background: ring.risk_score >= 90 ? "#dc2626" : ring.risk_score >= 70 ? "#ea580c" : "#f59e0b", borderRadius: 8, padding: "6px 12px" }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: "white" }}>{ring.risk_score.toFixed(1)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ring.member_accounts.map(accId => (
                          <span key={accId} style={{ fontSize: 10, fontFamily: "monospace", background: ringColor.node + "20", color: ringColor.node, border: `1px solid ${ringColor.node}50`, borderRadius: 6, padding: "4px 8px" }}>{accId}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ TRANSACTIONS TAB ═════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, opacity: activeTab === "transactions" ? 1 : 0, pointerEvents: activeTab === "transactions" ? "auto" : "none", transform: activeTab === "transactions" ? "translateX(0)" : "translateX(18px)", transition: "opacity 0.2s ease, transform 0.2s ease", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "150px 1fr 36px 1fr 130px 120px", gap: "0 16px", padding: "16px 30px", background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
            {[ { key: "id", label: "TX ID", align: "left" }, { key: "sender", label: "SENDER", align: "left" }, { key: null, label: "", align: "center"}, { key: "receiver", label: "RECEIVER", align: "left" }, { key: "amount", label: "AMOUNT", align: "right" }, { key: "date", label: "DATE", align: "right" } ].map(({ key, label, align }, ci) => (
              <span key={ci} onClick={key ? () => handleSortClick(key) : undefined} style={{ color: key && sortKey === key ? "#fff" : "rgba(255,255,255,0.4)", textAlign: align, cursor: key ? "pointer" : "default", userSelect: "none" }}>{label}{key ? sortArrow(key) : ""}</span>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
            {visibleEdges.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No transactions match filter.</div>}
            {visibleEdges.map((e, i) => {
              const srcColor = getNodeColor(e.source), tgtColor = getNodeColor(e.target), srcSusp = !!suspiciousMap[e.source], tgtSusp = !!suspiciousMap[e.target];
              return (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr 36px 1fr 130px 120px", gap: "0 16px", padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", transition: "background 0.2s" }} onMouseEnter={el => el.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={el => el.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>{e.id}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: srcColor, boxShadow: srcSusp ? `0 0 8px ${srcColor}` : "none", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: srcSusp ? srcColor : "#fff" }}>{e.source}</span>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>→</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: tgtColor, boxShadow: tgtSusp ? `0 0 8px ${tgtColor}` : "none", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: tgtSusp ? tgtColor : "#fff" }}>{e.target}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", textAlign: "right" }}>₹{e.amount.toLocaleString("en-IN")}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "right", fontFamily: "monospace" }}>{(e.timestamp || "").slice(0, 10)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}