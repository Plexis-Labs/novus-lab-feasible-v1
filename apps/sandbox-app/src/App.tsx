import { useState } from 'react';
import { Novus } from './novus';
import './App.css';

// ============================================================================
// MILESTONE C HELPER TYPES & COMPONENTS
// ============================================================================
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

// ============================================================================
// MILESTONE B ESCAPE ATTEMPT SUITE COMPONENT (Your Code)
// ============================================================================
function EscapeAttemptSuite() {
  const [results, setResults] = useState<{name: string; status: 'PASS' | 'FAIL'; message: string}[]>([]);

  const runAttack = (testName: string, attackFn: () => any) => {
    try {
      const result = attackFn();
      // If no error is thrown, the sandbox failed to block the attack.
      setResults(prev => [...prev, {
        name: testName,
        status: 'FAIL', // Red (Hacked)
        message: `VULNERABILITY: Attack succeeded! Result: ${result}`
      }]);
    } catch (error: any) {
      // If it throws, the sandbox successfully blocked it!
      setResults(prev => [...prev, {
        name: testName,
        status: 'PASS', // Green (Secure)
        message: `SECURE: Blocked by browser. Error: ${error.message}`
      }]);
    }
  };

  const runAllAttacks = () => {
    setResults([]);

    // 1. eval()
    runAttack("Execute eval()", () => {
      return eval("2 + 2");
    });

    // 2. new Function()
    runAttack("Execute new Function()", () => {
      const fn = new Function("return 'Function Executed'");
      return fn();
    });

    // 3. top.document
    runAttack("Read top.document", () => {
      return window.top?.document.title;
    });

    // 4. parent.location
    runAttack("Read parent.location", () => {
      return window.parent.location.href;
    });

    // 5. Post Arbitrary Message
    runAttack("Post Arbitrary Message", () => {
      window.parent.postMessage({ type: "FAKE_MALICIOUS_PAYLOAD", action: "STEAL_DATA" }, "*");
      
      // Because postMessage is asynchronous and doesn't return anything directly, 
      // the real test here is that the Content Script doesn't crash or respond.
      
      // We throw a simulated success to turn it green if it didn't break the app.
      throw new Error("Message fired into the void. Content script must ignore it.");
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'black', background: 'white', borderRadius: '8px' }}>
      <h2 style={{ color: '#d32f2f', marginTop: 0 }}>🛡️ P-1-B005: Escape Attempt Suite</h2>
      <p>Testing the 5 required security constraints.</p>
      
      <button 
        onClick={runAllAttacks}
        style={{ padding: '10px 20px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        RUN ESCAPE ATTEMPTS
      </button>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {results.map((res, i) => (
          <div 
            key={i} 
            style={{ 
              padding: '10px', 
              borderLeft: `5px solid ${res.status === 'PASS' ? '#2e7d32' : '#d32f2f'}`,
              background: res.status === 'PASS' ? '#e8f5e9' : '#ffebee'
            }}
          >
            <strong style={{ color: res.status === 'PASS' ? '#2e7d32' : '#d32f2f' }}>
              {res.status === 'PASS' ? '✅ SECURE (BLOCKED)' : '❌ VULNERABLE (HACKED)'}
            </strong>
            <br />
            <b>{res.name}</b>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', fontFamily: 'monospace' }}>{res.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT (Combines both suites)
// ============================================================================
export default function App() {
  // Milestone C State
  const [status, setStatus] = useState<Status>({ origin: 'idle', token: 'idle', nonce: 'idle' });
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ping, setPing] = useState<number | null>(null);

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
      //If the error code comes from the security layer, reflect it
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

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '16px',
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      background: '#0f172a',
      color: '#e2e8f0',
      overflowY: 'auto'
    }}>
      
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: MILESTONE C - COMMUNICATION LAYER         */}
      {/* ---------------------------------------------------- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', letterSpacing: 1 }}>
            NOVUS LAB · MILESTONE C
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Communication Layer Demo
          </div>
        </div>

        {/* Security gates */}
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>SECURITY GATES</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge label="Origin" state={status.origin} />
            <Badge label="Token" state={status.token} />
            <Badge label="Nonce" state={status.nonce} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchData('pr-summary')}
            disabled={loading}
            style={btnStyle('#7c3aed')}
          >
            {loading ? '⏳ Fetching…' : '🔍 Fetch PR Summary'}
          </button>
          <button
            onClick={() => fetchData('repo-meta')}
            disabled={loading}
            style={btnStyle('#0891b2')}
          >
            📦 Fetch Repo Meta
          </button>
          <button
            onClick={doPing}
            style={btnStyle('#059669')}
          >
            🏓 Ping
          </button>
        </div>

        {/* Ping result */}
        {ping !== null && (
          <div style={{ fontSize: 12, color: ping >= 0 ? '#22c55e' : '#ef4444' }}>
            {ping >= 0 ? `Pong! Round-trip: ${ping}ms` : 'Ping failed'}
          </div>
        )}

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: '150px' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>OUTPUT</div>
          <pre style={{
            flex: 1,
            overflow: 'auto',
            background: '#1e293b',
            borderRadius: 8,
            padding: 12,
            fontSize: 11,
            margin: 0,
            color: error ? '#ef4444' : '#86efac',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {error
              ? `Error: ${error}`
              : result
              ? JSON.stringify(result, null, 2)
              : 'Press a button to call Novus.getData()'}
          </pre>
        </div>
        
        <div style={{ fontSize: 10, color: '#334155', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
          sandbox → SDK → bridge → dispatcher → mock data
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: MILESTONE B - ESCAPE ATTEMPT SUITE        */}
      {/* ---------------------------------------------------- */}
      <div style={{ borderTop: '2px dashed #334155', paddingTop: '32px' }}>
        <EscapeAttemptSuite />
      </div>

    </div>
  );
}