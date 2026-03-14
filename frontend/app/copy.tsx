"use client";

import { useState, useEffect, useCallback } from "react";

// Use NEXT_PUBLIC_API_URL from .env.local (falls back to localhost:3000)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type Ambience = "forest" | "ocean" | "mountain";

interface EmotionAnalysis {
  emotion: string;
  keywords: string[];
  summary: string;
}

interface JournalEntry {
  id?: string;
  _id?: string;
  userId: string;
  ambience: Ambience;
  text: string;
  createdAt?: string;
  created_at?: string;
  timestamp?: string;
  // Note: the backend uses `emotion`, `keywords`, `summary`
  // We keep `analysis`/`emotion_analysis` for compatibility if needed
  analysis?: EmotionAnalysis;
  emotion_analysis?: EmotionAnalysis;
}

interface InsightsData {
  totalEntries: number;
  topEmotion: string;
  mostUsedAmbience: string;
  recentKeywords: string[];
}

interface ToastState {
  msg: string;
  type: "success" | "error";
}

const ambienceIcon = (a: Ambience | string): string =>
  ({ forest: "🌲", ocean: "🌊", mountain: "⛰️" }[a] ?? "🌿");

const formatDate = (iso?: string): string => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --bg:#0d1208; --surface:#141a0e; --surface2:#1c2614;
  --border:rgba(160,185,120,0.15); --accent:#8fb85a; --accent2:#c5e07d;
  --text:#d4ddc4; --muted:#7a9060;
  --font-d:'Lora',Georgia,serif; --font-b:'DM Sans',sans-serif;
  --r:12px;
}
.ax-root *{box-sizing:border-box;margin:0;padding:0}
.ax-root{background:var(--bg);color:var(--text);font-family:var(--font-b);font-size:14px;min-height:100vh;padding:32px 20px 80px}
.ax-inner{max-width:900px;margin:0 auto}
.ax-header{text-align:center;margin-bottom:48px;animation:axUp .6s ease both}
.ax-logo{font-size:28px;display:block;filter:drop-shadow(0 0 12px rgba(143,184,90,.4));margin-bottom:8px}
.ax-header h1{font-family:var(--font-d);font-size:clamp(26px,5vw,38px);font-weight:600;color:var(--accent2);letter-spacing:-.5px;margin-bottom:6px}
.ax-header p{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.6px}
.ax-user{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--border);border-radius:40px;padding:8px 16px;margin-bottom:32px;animation:axUp .6s .1s ease both}
.ax-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 6px var(--accent);flex-shrink:0}
.ax-user label{color:var(--muted);font-size:12px;white-space:nowrap}
.ax-user input{background:transparent;border:none;color:var(--text);font-family:var(--font-b);font-size:13px;flex:1;outline:none}
.ax-user input::placeholder{color:var(--muted);opacity:.5}
.ax-tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:40px;padding:4px;margin-bottom:28px;animation:axUp .6s .15s ease both}
.ax-tab{flex:1;padding:9px 14px;border-radius:30px;border:none;background:transparent;color:var(--muted);font-family:var(--font-b);font-size:13px;cursor:pointer;transition:all .25s}
.ax-tab:hover{color:var(--text)}
.ax-tab.active{background:var(--surface2);color:var(--accent2);border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.3)}
.ax-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;animation:axUp .4s ease both}
.ax-amb-row{display:flex;gap:1px;background:var(--border)}
.ax-amb{flex:1;padding:14px;border:none;background:var(--surface);color:var(--muted);font-family:var(--font-b);font-size:12px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:5px}
.ax-amb:hover{background:var(--surface2)}
.ax-amb.active{background:var(--surface2)}
.ax-amb.active[data-amb=forest]{color:#8fb85a;border-bottom:2px solid #8fb85a}
.ax-amb.active[data-amb=ocean]{color:#5ab8d4;border-bottom:2px solid #5ab8d4}
.ax-amb.active[data-amb=mountain]{color:#a07ac0;border-bottom:2px solid #a07ac0}
.ax-amb-icon{font-size:20px}
.ax-amb-lbl{text-transform:uppercase;letter-spacing:.8px;font-size:10px}
.ax-ta-wrap{padding:20px}
.ax-ta{width:100%;background:transparent;border:none;color:var(--text);font-family:var(--font-d);font-size:15px;line-height:1.75;resize:none;outline:none}
.ax-ta::placeholder{color:var(--muted);opacity:.4;font-style:italic}
.ax-footer{padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.ax-chars{color:var(--muted);font-size:12px}
.ax-btn{padding:9px 20px;border-radius:30px;border:none;cursor:pointer;font-family:var(--font-b);font-size:13px;font-weight:500;transition:all .2s}
.ax-btn-primary{background:var(--accent);color:#0d1208}
.ax-btn-primary:hover{background:var(--accent2);transform:translateY(-1px)}
.ax-btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none}
.ax-btn-ghost{background:transparent;border:1px solid var(--border);color:var(--muted)}
.ax-btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.ax-btn-analyze{background:rgba(143,184,90,.1);border:1px solid rgba(143,184,90,.3);color:var(--accent);padding:6px 14px;font-size:12px}
.ax-btn-analyze:hover{background:rgba(143,184,90,.2)}
.ax-btn-analyze:disabled{opacity:.4;cursor:not-allowed}
.ax-list-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.ax-list-hdr h2{font-family:var(--font-d);font-size:16px}
.ax-entry{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;margin-bottom:12px;transition:border-color .2s;animation:axUp .35s ease both}
.ax-entry:hover{border-color:rgba(160,185,120,.3)}
.ax-meta{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.ax-tag{padding:3px 10px;border-radius:20px;font-size:11px;text-transform:uppercase;letter-spacing:.7px;font-weight:500}
.ax-tag.forest{background:rgba(74,124,47,.2);color:#8fb85a;border:1px solid rgba(74,124,47,.3)}
.ax-tag.ocean{background:rgba(43,107,138,.2);color:#5ab8d4;border:1px solid rgba(43,107,138,.3)}
.ax-tag.mountain{background:rgba(107,77,138,.2);color:#a07ac0;border:1px solid rgba(107,77,138,.3)}
.ax-edate{color:var(--muted);font-size:11px;margin-left:auto}
.ax-etext{font-family:var(--font-d);font-size:14px;line-height:1.7;margin-bottom:12px}
.ax-eactions{display:flex;justify-content:flex-end;margin-top:8px}
.ax-analysis{background:var(--surface2);border-radius:8px;padding:12px 14px;margin-top:10px;border:1px solid var(--border)}
.ax-arow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px}
.ax-emotion{background:rgba(143,184,90,.15);color:var(--accent2);border:1px solid rgba(143,184,90,.25);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;text-transform:capitalize}
.ax-kw{background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);padding:2px 8px;border-radius:10px;font-size:11px}
.ax-summary{color:var(--muted);font-size:12px;line-height:1.6;margin-top:4px;font-style:italic}
.ax-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}
@media(min-width:600px){.ax-grid{grid-template-columns:repeat(4,1fr)}}
.ax-stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 16px;text-align:center;animation:axUp .35s ease both}
.ax-stat-val{font-family:var(--font-d);font-size:28px;color:var(--accent2);font-weight:600;margin-bottom:4px}
.ax-stat-lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px}
.ax-kw-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;animation:axUp .4s ease both}
.ax-kw-card h3{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px}
.ax-kw-wrap{display:flex;flex-wrap:wrap;gap:8px}
.ax-kw-big{padding:6px 14px;border-radius:20px;font-size:13px;background:rgba(143,184,90,.08);border:1px solid rgba(143,184,90,.2);color:var(--accent)}
.ax-empty{text-align:center;padding:60px 20px;color:var(--muted)}
.ax-empty span{font-size:36px;display:block;opacity:.4;margin-bottom:12px}
.ax-empty p{font-size:13px}
.ax-loading{text-align:center;padding:40px;color:var(--muted);font-size:13px}
.ax-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(143,184,90,.3);border-top-color:var(--accent);border-radius:50%;animation:axSpin .6s linear infinite;margin-right:6px;vertical-align:middle}
.ax-toast{position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:8px;font-size:13px;z-index:9999;transform:translateY(60px);opacity:0;transition:all .3s;pointer-events:none}
.ax-toast.show{transform:translateY(0);opacity:1}
.ax-toast.success{background:rgba(74,124,47,.9);border:1px solid #4a7c2f;color:#c5e07d}
.ax-toast.error{background:rgba(192,90,74,.9);border:1px solid #c05a4a;color:#ffd0c8}
@keyframes axUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes axSpin{to{transform:rotate(360deg)}}
`;

function Toast({ msg, type }: ToastState) {
  return (
    <div className={`ax-toast${msg ? ` show ${type}` : ""}`}>{msg}</div>
  );
}

function AnalysisBlock({ analysis }: { analysis: EmotionAnalysis }) {
  const keywords = Array.isArray(analysis.keywords) ? analysis.keywords : [];
  return (
    <div className="ax-analysis">
      <div className="ax-arow">
        <span className="ax-emotion">● {analysis.emotion || "–"}</span>
        {keywords.map((k) => (
          <span key={k} className="ax-kw">{k}</span>
        ))}
      </div>
      {analysis.summary && (
        <div className="ax-summary">{analysis.summary}</div>
      )}
    </div>
  );
}

function EntryCard({
  entry,
  onAnalyze,
}: {
  entry: JournalEntry;
  onAnalyze: (text: string) => Promise<EmotionAnalysis | null>;
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(
    // Initialize analysis from entry if available
    entry.analysis ?? entry.emotion_analysis ?? null
  );

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await onAnalyze(entry.text);
    if (result) setAnalysis(result);
    setLoading(false);
  };

  const entryKey = entry.id ?? entry._id ?? entry.createdAt ?? "";
  const dateStr = formatDate(entry.createdAt ?? entry.created_at ?? entry.timestamp);

  return (
    <div className="ax-entry">
      <div className="ax-meta">
        <span className={`ax-tag ${entry.ambience}`}>
          {ambienceIcon(entry.ambience)} {entry.ambience}
        </span>
        <span className="ax-edate">{dateStr}</span>
      </div>
      <div className="ax-etext">{entry.text}</div>
      {analysis ? (
        <AnalysisBlock analysis={analysis} />
      ) : (
        <div className="ax-eactions">
          <button
            className="ax-btn ax-btn-analyze"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <><span className="ax-spin" />Analyzing…</>
            ) : (
              "✦ Analyze"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function WriteTab({
  userId,
  onSaved,
}: {
  userId: string;
  onSaved: (msg: string, type: "success" | "error") => void;
}) {
  const [ambience, setAmbience] = useState<Ambience>("forest");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ambience, text }),
      });
      if (!res.ok) throw new Error("Save failed");
      setText("");
      onSaved("Entry saved 🌿", "success");
    } catch {
      onSaved("Failed to save. Is the backend running?", "error");
    } finally {
      setSaving(false);
    }
  };

  const ambienceOptions: [Ambience, string][] = [
    ["forest", "🌲"],
    ["ocean", "🌊"],
    ["mountain", "⛰️"],
  ];

  return (
    <div className="ax-card">
      <div className="ax-amb-row">
        {ambienceOptions.map(([a, icon]) => (
          <button
            key={a}
            className={`ax-amb${ambience === a ? " active" : ""}`}
            data-amb={a}
            onClick={() => setAmbience(a)}
          >
            <span className="ax-amb-icon">{icon}</span>
            <span className="ax-amb-lbl">{a}</span>
          </button>
        ))}
      </div>
      <div className="ax-ta-wrap">
        <textarea
          className="ax-ta"
          rows={7}
          placeholder="How did the session make you feel? Describe your experience with nature…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="ax-footer">
        <span className="ax-chars">
          {text.length} character{text.length !== 1 ? "s" : ""}
        </span>
        <button
          className="ax-btn ax-btn-primary"
          onClick={save}
          disabled={saving || !text.trim()}
        >
          {saving ? <><span className="ax-spin" />Saving…</> : "Save Entry"}
        </button>
      </div>
    </div>
  );
}

function EntriesTab({
  userId,
  onToast,
}: {
  userId: string;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [entries, setEntries] = useState<JournalEntry[] | "error" | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/journal/${userId}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      const list: JournalEntry[] = Array.isArray(data) ? data : (data.entries ?? []);
      setEntries([...list].reverse());
    } catch {
      setEntries("error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAnalyze = async (
    text: string
  ): Promise<EmotionAnalysis | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/journal/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      onToast("Analysis complete ✦", "success");
      return (await res.json()) as EmotionAnalysis;
    } catch {
      onToast("Analysis failed.", "error");
      return null;
    }
  };

  return (
    <div>
      <div className="ax-list-hdr">
        <h2>Your Entries</h2>
        <button
          className="ax-btn ax-btn-ghost"
          onClick={load}
          disabled={loading}
          style={{ fontSize: 12, padding: "7px 14px" }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading && <div className="ax-loading">Fetching entries…</div>}

      {!loading && entries === "error" && (
        <div className="ax-empty">
          <span>⚠️</span>
          <p>Couldn&apos;t load entries. Is the backend running?</p>
        </div>
      )}

      {!loading && Array.isArray(entries) && entries.length === 0 && (
        <div className="ax-empty">
          <span>📜</span>
          <p>No entries yet. Start by writing one.</p>
        </div>
      )}

      {!loading && Array.isArray(entries) &&
        entries.map((e) => (
          <EntryCard
            key={e.id ?? e._id ?? e.createdAt}
            entry={e}
            onAnalyze={handleAnalyze}
          />
        ))}
    </div>
  );
}

function InsightsTab({ userId }: { userId: string }) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/journal/insights/${userId}`);
        if (!res.ok) throw new Error("Insights failed");
        setData((await res.json()) as InsightsData);
      } catch {
        setError(true);
      }
    })();
  }, [userId]);

  if (error)
    return (
      <div className="ax-empty">
        <span>⚠️</span>
        <p>Couldn&apos;t load insights. Is the backend running?</p>
      </div>
    );

  if (!data) return <div className="ax-loading">Gathering insights…</div>;

  const keywords = Array.isArray(data.recentKeywords) ? data.recentKeywords : [];

  return (
    <div>
      <div className="ax-grid">
        <div className="ax-stat">
          <div className="ax-stat-val">{data.totalEntries ?? "–"}</div>
          <div className="ax-stat-lbl">Total Entries</div>
        </div>
        <div className="ax-stat">
          <div
            className="ax-stat-val"
            style={{ fontSize: 20, textTransform: "capitalize" }}
          >
            {data.topEmotion ?? "–"}
          </div>
          <div className="ax-stat-lbl">Top Emotion</div>
        </div>
        <div className="ax-stat">
          <div
            className="ax-stat-val"
            style={{ fontSize: 18, textTransform: "capitalize" }}
          >
            {data.mostUsedAmbience ?? "–"}
          </div>
          <div className="ax-stat-lbl">Fav. Ambience</div>
        </div>
        <div className="ax-stat">
          <div className="ax-stat-val">{keywords.length}</div>
          <div className="ax-stat-lbl">Keywords</div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="ax-kw-card">
          <h3>Recent Keywords</h3>
          <div className="ax-kw-wrap">
            {keywords.map((k) => (
              <span key={k} className="ax-kw-big">{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = "write" | "entries" | "insights";
const TABS = [
  { key: "write", label: "✍️ Write" },
  { key: "entries", label: "📖 Entries" },
  { key: "insights", label: "✨ Insights" },
];

export default function JournalPage() {
  const [userId, setUserId] = useState("user_001");
  const [tab, setTab] = useState<Tab>("write");
  const [toast, setToast] = useState<ToastState>({ msg: "", type: "success" });

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(prev => ({ ...prev, msg: "" })), 2800);
    },
    []
  );

  useEffect(() => {
    if (document.getElementById("ax-styles")) return;
    const s = document.createElement("style");
    s.id = "ax-styles";
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => {
      document.getElementById("ax-styles")?.remove();
    };
  }, []);

  return (
    <div className="ax-root">
      <div className="ax-inner">
        <header className="ax-header">
          <span className="ax-logo">🌿</span>
          <h1>ArvyaX Journal</h1>
          <p>Nature · Reflection · Insight</p>
        </header>

        <div className="ax-user">
          <span className="ax-dot" />
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
          />
        </div>

        <div className="ax-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`ax-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "write" && <WriteTab userId={userId} onSaved={showToast} />}
        {tab === "entries" && <EntriesTab userId={userId} onToast={showToast} />}
        {tab === "insights" && <InsightsTab userId={userId} />}
      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
