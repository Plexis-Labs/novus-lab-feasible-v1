import { useState } from 'react';
import './App.css';

export default function MaliciousApp() {
  const [results, setResults] = useState<{name: string; status: 'PENDING' | 'PASS' | 'FAIL'; message: string}[]>([]);

  const runAttack = (testName: string, attackFn: () => any, expectsBlock = true) => {
    try {
      const result = attackFn();
      
      setResults(prev => [...prev, {
        name: testName,
        status: expectsBlock ? 'FAIL' : 'PASS',
        message: `VULNERABILITY: Attack succeeded! Returned: ${result}`
      }]);
    } catch (error: any) {
      // If we catch an error, Chrome blocked the attack (which means the sandbox HELD)
      setResults(prev => [...prev, {
        name: testName,
        status: expectsBlock ? 'PASS' : 'FAIL',
        message: `SECURE: Blocked by browser. Error: ${error.name} - ${error.message}`
      }]);
    }
  };

  const runAllAttacks = () => {
    setResults([]);

    // B004: Isolate Host DOM
    runAttack("Read parent.location (B004)", () => {
      return window.parent.location.href;
    });

    // B004: Isolate Top DOM
    runAttack("Read top.document (B005)", () => {
      return window.top?.document.title;
    });

    // B004: Extension API Access
    runAttack("Access chrome.runtime (B004)", () => {
      // @ts-ignore
      return chrome.runtime.id;
    });

    // B004: Cookie Access
    runAttack("Steal Host Cookies (B004)", () => {
      const cookies = document.cookie;
      // If it has actual cookies from localhost:3000, we failed.
      if (cookies.length > 0) throw new Error("Stolen cookies: " + cookies);
      return "Empty cookie jar (Safe)";
    });

    // B005: Eval Execution
    runAttack("Execute eval() (B005)", () => {
      return eval("2 + 2 === 4 ? 'Eval Worked' : 'Failed'");
    });

    // B005: Function Execution
    runAttack("Execute new Function() (B005)", () => {
      const fn = new Function("return 'Function Worked'");
      return fn();
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'black' }}>
      <h2 style={{ color: '#d32f2f' }}>💣 Novus Attack Suite</h2>
      <p>Click below to attempt breaking out of the Phase -1 Sandbox.</p>
      
      <button 
        onClick={runAllAttacks}
        style={{ padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        EXECUTE ALL ATTACKS
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
              {res.status === 'PASS' ? '✅ PASS (BLOCKED)' : '❌ FAIL (HACKED)'}
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