import { useState } from 'react';
import { Novus } from './novus';
import './App.css';

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
      height: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      background: '#0f172a',
      color: '#e2e8f0',
    }}>
      {/* Header */}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0 }}>
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

      {/* Stack trace */}
      <div style={{ fontSize: 10, color: '#334155', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
        sandbox → SDK → bridge → dispatcher → mock data
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
