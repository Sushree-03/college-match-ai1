import { useEffect, useMemo, useRef, useState } from "react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Fira+Code&display=swap');
* { box-sizing: border-box; }
body { margin:0; font-family: Georgia, serif; }
.font-chalk { font-family:'Caveat', cursive; }
.font-mono { font-family:'Fira Code', monospace; }
.grid-paper {
  background-image:
    linear-gradient(to right, rgba(80,120,200,0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(80,120,200,0.18) 1px, transparent 1px);
  background-size: 28px 28px;
}
.blackboard {
  background:#1f3a2c;
  color:#f5f1d8;
  box-shadow: inset 0 0 60px rgba(0,0,0,0.5), 0 0 0 12px #5a3a1f, 0 0 0 16px #c8962b, 0 25px 50px -10px rgba(0,0,0,0.5);
  border-radius:6px;
}
.chalk-text { text-shadow:0 0 2px rgba(255,255,255,0.3); }
.paper {
  background:#f7f1de;
  background-image:
    linear-gradient(transparent 31px, rgba(80,120,200,0.25) 32px),
    linear-gradient(to right, transparent 39px, rgba(220,80,80,0.4) 40px, transparent 41px);
  background-size: 100% 32px, 100% 100%;
  color:#2a2240;
}
.calc-screen {
  background: linear-gradient(180deg,#b8d68a 0%,#9bc26a 100%);
  color:#1a3010;
  font-family:'Courier New', monospace;
}
.screen-glow {
  background:#1a1a2e;
  box-shadow: 0 0 0 2px #2d2d4a, 0 0 0 14px #0f0f1a, 0 0 40px rgba(80,140,255,0.4);
}
.book-spine {
  background: linear-gradient(to right,#3a1a10 0%,#6b2f1a 4%,#552415 8%,#7a3520 100%);
}
.tilt-wrap { perspective:1000px; }
.tilt { transition: transform 0.2s ease-out; transform-style: preserve-3d; }
.float { animation: float 6s ease-in-out infinite; }
.pencil { animation: pencil 3s ease-in-out infinite; transform-origin:bottom; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
@keyframes pencil { 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(-8deg) translateY(-10px)} }
@keyframes draw { to { stroke-dashoffset:0; } }
.graph-line { stroke-dasharray:300; stroke-dashoffset:300; animation: draw 1.6s ease-out forwards; }
input, select, button { font-family: inherit; }
.btn { cursor:pointer; border:none; transition:transform 0.15s, background 0.2s; }
.btn:active { transform:scale(0.95); }
.card-hover:hover img { transform:scale(1.1); }
`;

const DECOR = [
  { e: "📚", top: "8%", left: "4%", d: 30, r: -8 },
  { e: "📐", top: "15%", left: "92%", d: 50, r: 15 },
  { e: "🧮", top: "55%", left: "3%", d: 40, r: -5 },
  { e: "📊", top: "70%", left: "94%", d: 25, r: 8 },
  { e: "✏️", top: "35%", left: "96%", d: 60, r: 25 },
  { e: "📖", top: "85%", left: "6%", d: 35, r: 4 },
];

function FloatingDecor({ mouse }) {
  return DECOR.map((it, i) => (
    <div
      key={i}
      className="float"
      style={{
        position: "absolute",
        top: it.top,
        left: it.left,
        fontSize: 48,
        opacity: 0.3,
        pointerEvents: "none",
        transform: `translate(${(mouse.x * it.d) / 100}px, ${(mouse.y * it.d) / 100}px) rotate(${it.r}deg)`,
      }}
    >
      {it.e}
    </div>
  ));
}

function TiltCard({ children, style }) {
  const ref = useRef(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  return (
    <div className="tilt-wrap" style={style}>
      <div
        ref={ref}
        className="tilt"
        onMouseMove={(e) => {
          const r = ref.current.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          setT({ rx: -y * 12, ry: x * 12 });
        }}
        onMouseLeave={() => setT({ rx: 0, ry: 0 })}
        style={{ transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)` }}
      >
        {children}
      </div>
    </div>
  );
}

function MiniGraph({ value }) {
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const x = (i / 7) * 100;
      const y = Math.max(2, Math.min(58, 60 - value * 0.55 + (Math.sin(i * 1.7) + 1) * 6));
      arr.push(`${x},${y}`);
    }
    return arr.join(" ");
  }, [value]);

  return (
    <svg viewBox="0 0 100 60" style={{ width: "100%", height: 64 }}>
      <polyline points={pts} fill="none" stroke="#3a6cdf" strokeWidth="2" />
    </svg>
  );
}

export default function App() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [fee, setFee] = useState("");
  const [compare, setCompare] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rank, setRank] = useState("");
  const [exam, setExam] = useState("JEE");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    fetch("https://college-match-ai1.onrender.com/api/colleges")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const moveBg = (e) =>
    setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 30,
      y: (e.clientY / window.innerHeight - 0.5) * 30,
    });

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const f = Number(c.fees);
      const feeOk =
        fee === "" ||
        (fee === "low" && f <= 100000) ||
        (fee === "mid" && f > 100000 && f <= 300000) ||
        (fee === "high" && f > 300000);

      return (
        c.name?.toLowerCase().includes(search.toLowerCase()) &&
        (location === "" || c.location === location) &&
        feeOk
      );
    });
  }, [colleges, search, location, fee]);

  const toggleCompare = (c) => {
    const exists = compare.find((x) => x.id === c.id);
    if (exists) setCompare(compare.filter((x) => x.id !== c.id));
    else if (compare.length < 3) setCompare([...compare, c]);
    else alert("You can compare only 3 colleges");
  };

  const predicted = colleges.filter((c) => {
    const r = Number(rank);
    const rating = Number(c.rating);
    if (!r) return false;
    if (r <= 10000) return rating >= 4.5;
    if (r <= 50000) return rating >= 4;
    return rating >= 3.5;
  });

  if (selected) {
    return (
      <>
        <style>{STYLES}</style>
        <div onMouseMove={moveBg} style={{ minHeight: "100vh", padding: 24, background: "linear-gradient(135deg,#1a1830,#241e3a,#1a1525)", color: "#f0eada" }}>
          <FloatingDecor mouse={mouse} />

          <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 10 }}>
            <button className="btn" onClick={() => setSelected(null)} style={{ marginBottom: 24, padding: "10px 20px", background: "#c8962b", color: "#3a2010", fontWeight: "bold", borderRadius: 8 }}>
              ← Back
            </button>

            <TiltCard>
              <div className="paper" style={{ borderRadius: 8, padding: 32, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>
                <img src={selected.image_url} alt={selected.name} style={{ height: 280, width: "100%", objectFit: "cover", borderRadius: 6 }} />

                <h1 className="font-chalk" style={{ fontSize: 48 }}>{selected.name}</h1>
                <p>📍 {selected.location}</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  <div className="calc-screen" style={{ padding: 16 }}>Fees: ₹{Number(selected.fees).toLocaleString()}</div>
                  <div className="calc-screen" style={{ padding: 16 }}>Rating: {selected.rating} ★</div>
                  <div className="calc-screen" style={{ padding: 16 }}>Package: {selected.avg_package || 0} LPA</div>
                </div>

                <h2 className="font-chalk">📚 Courses</h2>
                <p>{selected.courses || "Courses not available"}</p>

                <h2 className="font-chalk">📊 Placements</h2>
                <MiniGraph value={selected.placement || 70} />
                <p>{selected.placement || 70}% placement record.</p>

                <h2 className="font-chalk">💬 Reviews</h2>
                <p>Students like campus, faculty, and placements.</p>
              </div>
            </TiltCard>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>

      <div onMouseMove={moveBg} style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#f5f1de,#ede4c8,#e0d4ad)", color: "#2a2240" }}>
        <div className="grid-paper" style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5 + scrollY * 0.2}px)` }} />

        <FloatingDecor mouse={mouse} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: 32, position: "relative", zIndex: 10 }}>
          <div className="blackboard" style={{ padding: "56px 32px", marginBottom: 48 }}>
            <h1 className="font-chalk chalk-text" style={{ fontSize: "clamp(40px,7vw,84px)", textAlign: "center", margin: 0 }}>
              CollegeMatch AI
            </h1>
            <p className="font-chalk chalk-text" style={{ textAlign: "center", fontSize: 24 }}>
              Explore, compare & predict your perfect college fit
            </p>
          </div>

          <div className="screen-glow" style={{ borderRadius: 14, padding: 20, marginBottom: 40 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <input className="calc-screen" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search colleges..." style={{ padding: "12px 16px", borderRadius: 6, width: 280, border: "none" }} />

              <select className="calc-screen" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "12px 16px", borderRadius: 6, border: "none" }}>
                <option value="">All Locations</option>
                {[...new Set(colleges.map((c) => c.location))].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <select className="calc-screen" value={fee} onChange={(e) => setFee(e.target.value)} style={{ padding: "12px 16px", borderRadius: 6, border: "none" }}>
                <option value="">All Fees</option>
                <option value="low">Under ₹1L</option>
                <option value="mid">₹1L - ₹3L</option>
                <option value="high">Above ₹3L</option>
              </select>
            </div>
          </div>

          {compare.length > 0 && (
            <div className="paper" style={{ borderRadius: 8, padding: 24, marginBottom: 40, overflowX: "auto" }}>
              <h2 className="font-chalk">📓 Compare Colleges</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["College", "Fees", "Placement", "Rating", "Location"].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compare.map((c) => (
                    <tr key={c.id}>
                      <td style={{ padding: 12 }}>{c.name}</td>
                      <td style={{ padding: 12 }}>₹{Number(c.fees).toLocaleString()}</td>
                      <td style={{ padding: 12 }}>{c.placement || 70}%</td>
                      <td style={{ padding: 12 }}>{c.rating} ★</td>
                      <td style={{ padding: 12 }}>{c.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="blackboard" style={{ padding: 32, marginBottom: 48 }}>
            <h2 className="font-chalk chalk-text">🎯 Rank Predictor</h2>

            <select value={exam} onChange={(e) => setExam(e.target.value)} style={{ padding: 12, marginRight: 12 }}>
              <option>JEE</option>
              <option>CUET</option>
              <option>VITEEE</option>
            </select>

            <input type="number" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Enter rank" style={{ padding: 12 }} />

            {predicted.map((c) => (
              <p key={c.id} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                ➜ {c.name} — {c.location}
              </p>
            ))}
          </div>

          <h2 className="font-chalk" style={{ fontSize: 36 }}>📚 The Library ({filtered.length})</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 32 }}>
            {filtered.map((c) => {
              const inCompare = compare.find((x) => x.id === c.id);

              return (
                <TiltCard key={c.id}>
                  <div className="card-hover" style={{ borderRadius: 6, overflow: "hidden", background: "#f7f1de", border: "2px solid rgba(90,58,31,0.4)" }}>
                    <div style={{ height: 180, overflow: "hidden" }}>
                      <img src={c.image_url} alt={c.name} style={{ height: "100%", width: "100%", objectFit: "cover", transition: "transform 0.7s" }} />
                    </div>

                    <div className="paper" style={{ padding: 20 }}>
                      <h2 className="font-chalk" style={{ fontSize: 28 }}>{c.name}</h2>
                      <p>📍 {c.location}</p>
                      <p>Fees: ₹{Number(c.fees).toLocaleString()}</p>
                      <p>Rating: {c.rating} ★</p>
                      <p>Package: {c.avg_package || 0} LPA</p>

                      <MiniGraph value={c.placement || 70} />

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" onClick={() => setSelected(c)} style={{ flex: 1, padding: 10, background: "#2a2240", color: "#f7f1de", borderRadius: 6 }}>
                          Open
                        </button>

                        <button className="btn" onClick={() => toggleCompare(c)} style={{ flex: 1, padding: 10, background: inCompare ? "#c8962b" : "transparent", color: "#2a2240", border: "2px solid #2a2240", borderRadius: 6 }}>
                          {inCompare ? "✓ Added" : "Compare"}
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}