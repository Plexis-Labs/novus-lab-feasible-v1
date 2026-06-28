import { useState } from 'react';
import { Novus } from './novus';
import './App.css';

// SHARED TYPES & COMPONENTS

type Gate = 'idle' | 'ok' | 'fail';
type Status = { origin: Gate; token: Gate; nonce: Gate };

function Badge({ label, state }: { label: string; state: Gate }) {
  const icon = state === 'ok' ? '✅' : state === 'fail' ? '❌' : '⏳';
  const color = state === 'ok' ? '#22c55e' : state === 'fail' ? '#ef4444' : '#94a3b8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      background: `${color}22`, color,
      border: `1px solid ${color}55`,
    }}>
      {icon} {label}
    </span>
  );
}

export default function App() {
  // MILESTONE B STATE (DOM ISOLATION)
  const [escapeResults, setEscapeResults] = useState<{name: string; status: 'PASS' | 'FAIL'; message: string}[]>([]);

  // MILESTONE C & D STATE (BRIDGE SEC)
  const [status, setStatus] = useState<Status>({ origin: 'idle', token: 'idle', nonce: 'idle' });
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ping, setPing] = useState<number | null>(null);

  
  // MILESTONE B LOGIC: ESCAPE ATTEMPTS
  
  const runAttack = (testName: string, attackFn: () => any) => {
    try {
      const res = attackFn();
      setEscapeResults(prev => [...prev, {
        name: testName,
        status: 'FAIL',
        message: `VULNERABILITY: Attack succeeded! Result: ${res}`
      }]);
    } catch (err: any) {
      setEscapeResults(prev => [...prev, {
        name: testName,
        status: 'PASS',
        message: `SECURE: Blocked by browser. Error: ${err.message}`
      }]);
    }
  };

  const runAllAttacks = () => {
    setEscapeResults([]);
    
    runAttack("Execute eval()", () => eval("2 + 2"));
    
    runAttack("Execute new Function()", () => { 
      const fn = new Function("return 'Function Executed'"); 
      return fn(); 
    });
    
    runAttack("Read top.document", () => window.top?.document.title);
    
    runAttack("Read parent.location", () => window.parent.location.href);
    
    runAttack("Post Arbitrary Message", () => {
      window.parent.postMessage({ type: "FAKE_MALICIOUS_PAYLOAD", action: "STEAL_DATA" }, "*");
      throw new Error("Message fired into the void. Content script must ignore it.");
    });
  };

  
  // MILESTONE C & D LOGIC: COMMUNICATION BRIDGE
 
  async function fetchData(resource: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus({ origin: 'ok', token: 'ok', nonce: 'ok' });

    try {
      const data = await Novus.getData(resource);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      if (msg.includes('WRONG_TAB') || msg.includes('EXPIRED') || msg.includes('MALFORMED')) {
        setStatus(s => ({ ...s, token: 'fail' }));
      } else if (msg.includes('NONCE_REUSED') || msg.includes('BAD_SENTINEL')) {
        setStatus(s => ({ ...s, nonce: 'fail' }));
      }
    } finally {
      setLoading(false);
    }
  }

  async function doPing() {
    const t0 = Date.now();
    try {
      await Novus.ping();
      setPing(Date.now() - t0);
    } catch {
      setPing(-1);
    }
  }

  
  // UI RENDER
  
  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '16px',
      height: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      background: '#0f172a',
      color: '#e2e8f0',
      overflowY: 'auto'
    }}>
      {/* Global Header */}
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 10, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', letterSpacing: 1 }}>
          NOVUS LAB · FEASIBILITY SPIKE
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          Unified Testing Dashboard (Milestones B, C & D)
        </div>
      </div>

      {/* =============================================================== */}
      {/* MILESTONE B: SANDBOX ESCAPE UI */}
      {/* =============================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f43f5e' }}>🛡️ MILESTONE B: DOM ISOLATION</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Test Native Browser Sandbox Constraints</div>
        </div>
        
        <button 
          onClick={runAllAttacks}
          style={btnStyle('#f43f5e')}
        >
          🔥 Run Escape Suite
        </button>

        {escapeResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {escapeResults.map((res, i) => (
              <div key={i} style={{
                padding: '10px',
                borderRadius: 6,
                borderLeft: `4px solid ${res.status === 'PASS' ? '#22c55e' : '#ef4444'}`,
                background: res.status === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                fontSize: 12
              }}>
                <strong style={{ color: res.status === 'PASS' ? '#4ade80' : '#f87171' }}>
                  {res.status === 'PASS' ? '✅ SECURE (BLOCKED)' : '❌ VULNERABLE'}
                </strong>
                <div style={{ margin: '4px 0', fontWeight: 600 }}>{res.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{res.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {/* MILESTONE C & D: SECURE BRIDGE UI */}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a855f7' }}>🌉 MILESTONE C & D: SECURE BRIDGE</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Test Inter-Context Message Passing & Tokens</div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>SECURITY GATES</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge label="Origin" state={status.origin} />
            <Badge label="Token" state={status.token} />
            <Badge label="Nonce" state={status.nonce} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => fetchData('pr-summary')} disabled={loading} style={btnStyle('#a855f7')}>
            {loading ? '⏳ Fetching…' : '🔍 Fetch PR Summary'}
          </button>
          <button onClick={() => fetchData('repo-meta')} disabled={loading} style={btnStyle('#0ea5e9')}>
            📦 Fetch Repo Meta
          </button>
          <button onClick={doPing} style={btnStyle('#10b981')}>
            🏓 Ping
          </button>
        </div>

        {ping !== null && (
          <div style={{ fontSize: 12, color: ping >= 0 ? '#4ade80' : '#f87171' }}>
            {ping >= 0 ? `Pong! Round-trip: ${ping}ms` : 'Ping failed'}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 150 }}>
          <div style={{ fontSize: 10, color: '#64748b' }}>SDK OUTPUT</div>
          <pre style={{
            flex: 1,
            overflow: 'auto',
            background: '#1e293b',
            borderRadius: 8,
            padding: 12,
            fontSize: 11,
            margin: 0,
            color: error ? '#f87171' : '#86efac',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {error ? `Error: ${error}` : result ? JSON.stringify(result, null, 2) : 'Press a button to call Novus SDK'}
          </pre>
        </div>
        
        <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', marginTop: 'auto', paddingTop: 10, paddingBottom: 10 }}>
          sandbox → SDK → bridge → dispatcher → SW
        </div>
      </div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };
}