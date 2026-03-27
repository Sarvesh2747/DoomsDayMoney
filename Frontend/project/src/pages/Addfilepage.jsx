import { useRef, useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { ArrowLeft } from "lucide-react";

export default function AddFilePage({ onNavigate }) {
  const { loadCSV, fileName, nodes, edges, fraudData, loading, error } = useTransactions();
  const fileRef = useRef(null);
  const hasFile = !!fileName;
  
  // Mouse position for reactive lighting effects (Peak UI)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  function handleFile(file) {
    if (file) loadCSV(file);
  }

  const fontMain = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        fontFamily: fontMain,
        position: "relative",
        backgroundColor: "#05050a", // Deep ambient cinematic dark
        color: "#ffffff",
      }}
    >
      {/* ── STYLESHEET EXCLUSIVELY FOR PEAK UI ANIMATIONS ── */}
      <style>{`
        html, body, #root { margin: 0; padding: 0; background: #05050a; width: 100%; height: 100%; }
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
        @keyframes floatEffect {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .peak-glass-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          letter-spacing: 0.5px;
          padding: 12px 28px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        .peak-glass-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-20deg);
          transition: 0.5s;
        }
        .peak-glass-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .peak-glass-btn:hover::before {
          left: 150%;
        }
        .ambient-glow-card {
          position: relative;
          background: rgba(15, 15, 20, 0.5);
          backdrop-filter: blur(40px) saturate(150%);
          -webkit-backdrop-filter: blur(40px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          box-shadow: 
            0 30px 60px rgba(0,0,0,0.6), 
            inset 0 0 20px rgba(255,255,255,0.02),
            inset 0 1px 0 rgba(255,255,255,0.1);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease;
        }
        .ambient-glow-card:hover {
          transform: translateY(-5px) scale(1.01);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 40px 80px rgba(0,0,0,0.8),
            0 0 40px rgba(255,255,255,0.05),
            inset 0 0 30px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        /* Film grain */
        .cinematic-grain {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E');
          opacity: 0.05;
          mix-blend-mode: color-dodge;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* ── REALISTIC AMBIENT LIGHTING ORBS ── */}
      <div style={{
        position: "absolute",
        top: "20%", left: "30%",
        width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(0,0,0,0) 70%)",
        animation: "orbDrift1 25s ease-in-out infinite alternate",
        transformOrigin: "center",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%", right: "-10%",
        width: "50vw", height: "50vw",
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(0,0,0,0) 70%)",
        animation: "orbDrift2 30s ease-in-out infinite alternate",
        transformOrigin: "center",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        top: "-20%", right: "10%",
        width: "40vw", height: "40vw",
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(0,0,0,0) 70%)",
        animation: "orbDrift1 35s ease-in-out infinite alternate-reverse",
        transformOrigin: "center",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Reactive cursor spotlight */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.03), transparent 40%)`,
        pointerEvents: "none",
        zIndex: 1
      }} />

      <div className="cinematic-grain" />

      {/* ── PREMIUM PEAK UI HEADER ── */}
      <header
        style={{
          height: 72,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          background: "rgba(10, 10, 12, 0.6)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", cursor: "pointer", marginRight: "8px", color: "rgba(255,255,255,0.7)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="white"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.7)"}>
             <ArrowLeft size={24} />
          </div>
          <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <div
              style={{
                width: 42, height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 22, color: "#fff",
                boxShadow: "0 0 20px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.6)",
                textShadow: "0 0 15px rgba(255,255,255,0.8)"
              }}
            >
              D
            </div>
            <span style={{ 
              fontWeight: 900, 
              fontSize: 24, 
              letterSpacing: "0.25em", 
              textTransform: "uppercase", 
              background: "linear-gradient(to bottom, #ffffff 30%, #555555 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
              marginLeft: 8
            }}>
              DOOMSDAY
            </span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 8px" }}>|</span>
          <span style={{ fontWeight: 500, fontSize: 14, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
            FILE PROTOCOL
          </span>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {hasFile && (
            <>
              <button 
                className="peak-glass-btn"
                onClick={() => onNavigate("graph")}>
                Network Analysis
              </button>
              <button 
                className="peak-glass-btn"
                onClick={() => onNavigate("details")}>
                Intel Ledger
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          gap: 40,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ── REALISTIC GLASS UPLOAD ZONE ── */}
        <div
          className="ambient-glow-card"
          onClick={() => { if (!hasFile) fileRef.current?.click(); }}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          onDragOver={e => e.preventDefault()}
          style={{
            cursor: hasFile ? "default" : "pointer",
            textAlign: "center",
            width:   hasFile ? 480 : 640,
            padding: hasFile ? "48px" : "80px 48px",
            animation: "floatEffect 8s ease-in-out infinite",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                fontSize: hasFile ? 48 : 80,
                marginBottom: hasFile ? 20 : 32,
                lineHeight: 1,
                transition: "all 0.5s ease",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                opacity: 0.9
              }}
            >
              {loading ? "⚙️" : hasFile ? "🛡️" : "📂"}
            </div>

            <h2
              style={{
                fontSize: hasFile ? 22 : 36,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                marginBottom: 16,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 15px rgba(0,0,0,0.8)"
              }}
            >
              {loading
                ? "Decrypting Matrix..."
                : hasFile
                ? `Payload Ready: ${fileName}`
                : "Initialize Protocol File"}
            </h2>

            {!hasFile && !loading && (
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 400, lineHeight: 1.6 }}>
                Click or Drop structural data archives.
                <br />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 8, display: "inline-block" }}>
                  Schema: ID · SENDER · RECEIVER · AMOUNT · TIMESTAMP
                </span>
              </p>
            )}

            {hasFile && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 24 }}>
                <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 36, fontWeight: 300, color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>{nodes.length}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>Entities</span>
                  </div>
                  <div style={{ width: 1, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)" }} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 36, fontWeight: 300, color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>{edges.length}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>Connections</span>
                  </div>
                </div>
                {fraudData && (
                  <div style={{ 
                    marginTop: 8,
                    padding: "12px 24px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: 12,
                    fontSize: 13, color: "rgba(252, 165, 165, 0.9)", fontWeight: 500,
                    letterSpacing: "0.05em",
                    boxShadow: "inset 0 0 20px rgba(239,68,68,0.1), 0 4px 15px rgba(0,0,0,0.3)"
                  }}>
                    ⚠️ {fraudData.summary.suspicious_accounts_flagged} Critical Anomalies Detected
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {error && (
          <div
            style={{
              fontSize: 14,
              color: "#fca5a5",
              background: "rgba(20, 5, 5, 0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 16,
              padding: "16px 32px",
              maxWidth: 640,
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {error}
          </div>
        )}

        {hasFile && !loading && (
          <div style={{ display: "flex", gap: 20, animation: "floatEffect 9s ease-in-out infinite reverse" }}>
            <button
              className="peak-glass-btn"
              onClick={() => onNavigate("graph")}>
              Initialize Uplink
            </button>
            <button
              className="peak-glass-btn"
              onClick={() => onNavigate("details")}>
              Audit Logs
            </button>
            <button
              className="peak-glass-btn"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))",
                border: "1px solid rgba(139,92,246,0.6)",
                color: "#c4b5fd",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={() => fileRef.current?.click()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Another File
            </button>
          </div>
        )}

        {!hasFile && !loading && (
          <div
            className="ambient-glow-card"
            style={{
              maxWidth: 640,
              padding: "24px 32px",
              borderRadius: 20,
              animation: "floatEffect 10s ease-in-out infinite 1s",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 600,
                marginBottom: 20,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Data Architecture
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              <thead>
                <tr>
                  {["TRX_ID","SENDER","RECEIVER","AMOUNT","TIMESTAMP"].map((h, idx) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0 12px 12px 12px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.4)"
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["T001", "ACC_A", "ACC_B", "5000.00", "2024-01-15 10:30:00"],
                  ["T002", "ACC_B", "ACC_C", "3200.50", "2024-01-15 11:00:23"],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "16px 12px 4px 12px",
                          fontFamily: "'SF Mono', Monaco, Consolas, monospace",
                          fontSize: 12,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}