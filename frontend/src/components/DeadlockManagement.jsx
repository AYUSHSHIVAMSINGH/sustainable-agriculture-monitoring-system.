import React, { useState } from 'react';
import {
  validateBankersInput,
  computeNeedMatrix,
  runBankersSafetyAlgorithm,
  validateDetectionInput,
  runDeadlockDetectionAlgorithm,
} from '../utils/deadlockAlgorithms';

// Predefined Agricultural Tasks & Resources for Banker's Algorithm
const DEFAULT_PROCESSES = [
  { id: 'P0', name: 'Irrigation Pump Zone A' },
  { id: 'P1', name: 'Fertilizer Injector' },
  { id: 'P2', name: 'Sprinkler Zone B' },
  { id: 'P3', name: 'Greenhouse Cooling Fan' },
  { id: 'P4', name: 'Drainage Valve' },
];

const DEFAULT_RESOURCES = [
  { name: 'Water Pump Units (R0)' },
  { name: 'Chemical Valve Units (R1)' },
  { name: 'Power Inverter kW (R2)' },
];

// Worked Safe Dataset (Classic Textbook Example mapped to smart farm)
const SAFE_BANKERS_DATA = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  available: [3, 3, 2],
};

// Worked Unsafe Dataset (Resources constrained so no process can satisfy Need)
const UNSAFE_BANKERS_DATA = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  available: [0, 0, 0],
};

// Deadlock Detection Predefined Datasets
const DETECTION_SAFE_DATA = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 3],
    [2, 1, 1],
    [0, 0, 2],
  ],
  request: [
    [0, 0, 0],
    [2, 0, 2],
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 2],
  ],
  available: [0, 0, 0],
};

const DETECTION_DEADLOCKED_DATA = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 3],
    [2, 1, 1],
    [0, 0, 2],
  ],
  request: [
    [0, 0, 0],
    [2, 0, 2],
    [0, 0, 1], // P2 requires R2, causing circular resource dependency
    [1, 0, 0],
    [0, 0, 2],
  ],
  available: [0, 0, 0],
};

export default function DeadlockManagement() {
  const [activeTab, setActiveTab] = useState('bankers'); // 'bankers' | 'detection' | 'theory'

  // Banker's Algorithm State
  const [bAllocation, setBAllocation] = useState(SAFE_BANKERS_DATA.allocation);
  const [bMax, setBMax] = useState(SAFE_BANKERS_DATA.max);
  const [bAvailable, setBAvailable] = useState(SAFE_BANKERS_DATA.available);
  const [bResult, setBResult] = useState(null);
  const [bError, setBError] = useState(null);

  // Deadlock Detection State
  const [dAllocation, setDAllocation] = useState(DETECTION_SAFE_DATA.allocation);
  const [dRequest, setDRequest] = useState(DETECTION_SAFE_DATA.request);
  const [dAvailable, setDAvailable] = useState(DETECTION_SAFE_DATA.available);
  const [dResult, setDResult] = useState(null);
  const [dError, setDError] = useState(null);

  // Automatically computed Need Matrix for Banker's
  const needMatrix = computeNeedMatrix(bAllocation, bMax);

  // ----------------------------------------
  // Banker's Handlers
  // ----------------------------------------
  const handleCalculateBankers = () => {
    const val = validateBankersInput(DEFAULT_PROCESSES, DEFAULT_RESOURCES, bAllocation, bMax, bAvailable);
    if (!val.valid) {
      setBError(val.error);
      setBResult(null);
      return;
    }
    setBError(null);
    const result = runBankersSafetyAlgorithm(DEFAULT_PROCESSES, DEFAULT_RESOURCES, bAllocation, bMax, bAvailable);
    setBResult(result);
  };

  const handleLoadSafeBankers = () => {
    setBAllocation(SAFE_BANKERS_DATA.allocation);
    setBMax(SAFE_BANKERS_DATA.max);
    setBAvailable(SAFE_BANKERS_DATA.available);
    setBResult(null);
    setBError(null);
  };

  const handleLoadUnsafeBankers = () => {
    setBAllocation(UNSAFE_BANKERS_DATA.allocation);
    setBMax(UNSAFE_BANKERS_DATA.max);
    setBAvailable(UNSAFE_BANKERS_DATA.available);
    setBResult(null);
    setBError(null);
  };

  const handleResetBankers = () => {
    setBAllocation(Array(5).fill([0, 0, 0]));
    setBMax(Array(5).fill([0, 0, 0]));
    setBAvailable([0, 0, 0]);
    setBResult(null);
    setBError(null);
  };

  const updateMatrixCell = (matrix, setMatrix, row, col, value) => {
    const val = parseInt(value, 10);
    const updated = matrix.map((r, rIdx) =>
      rIdx === row ? r.map((c, cIdx) => (cIdx === col ? (isNaN(val) ? 0 : Math.max(0, val)) : c)) : r
    );
    setMatrix(updated);
  };

  const updateVectorCell = (vector, setVector, index, value) => {
    const val = parseInt(value, 10);
    const updated = vector.map((v, idx) => (idx === index ? (isNaN(val) ? 0 : Math.max(0, val)) : v));
    setVector(updated);
  };

  // ----------------------------------------
  // Detection Handlers
  // ----------------------------------------
  const handleCalculateDetection = () => {
    const val = validateDetectionInput(DEFAULT_PROCESSES, DEFAULT_RESOURCES, dAllocation, dRequest, dAvailable);
    if (!val.valid) {
      setDError(val.error);
      setDResult(null);
      return;
    }
    setDError(null);
    const result = runDeadlockDetectionAlgorithm(DEFAULT_PROCESSES, DEFAULT_RESOURCES, dAllocation, dRequest, dAvailable);
    setDResult(result);
  };

  const handleLoadSafeDetection = () => {
    setDAllocation(DETECTION_SAFE_DATA.allocation);
    setDRequest(DETECTION_SAFE_DATA.request);
    setDAvailable(DETECTION_SAFE_DATA.available);
    setDResult(null);
    setDError(null);
  };

  const handleLoadDeadlockedDetection = () => {
    setDAllocation(DETECTION_DEADLOCKED_DATA.allocation);
    setDRequest(DETECTION_DEADLOCKED_DATA.request);
    setDAvailable(DETECTION_DEADLOCKED_DATA.available);
    setDResult(null);
    setDError(null);
  };

  return (
    <div className="page-container">
      {/* Intro Hero */}
      <div className="hero-card">
        <div className="hero-tag">
          <span>🛡️ Operating Systems PBL • Deadlock Management Module</span>
        </div>
        <h2 className="hero-title">Deadlock Management & Banker's Algorithm</h2>
        <p className="hero-subtitle">
          Explore how the operating system handles finite shared physical resources (water pumps, fertilizer valves,
          power inverters) among competing farm processes using <strong>Deadlock Avoidance (Banker's Algorithm)</strong> and{' '}
          <strong>Deadlock Detection</strong>.
        </p>
      </div>

      {/* Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('bankers')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'bankers' ? '2px solid var(--primary)' : '1px solid var(--neutral-border)',
            background: activeTab === 'bankers' ? 'var(--primary-soft)' : 'var(--neutral-surface)',
            color: activeTab === 'bankers' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          1. Banker's Algorithm (Avoidance)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('detection')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'detection' ? '2px solid var(--primary)' : '1px solid var(--neutral-border)',
            background: activeTab === 'detection' ? 'var(--primary-soft)' : 'var(--neutral-surface)',
            color: activeTab === 'detection' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          2. Deadlock Detection
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theory')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'theory' ? '2px solid var(--primary)' : '1px solid var(--neutral-border)',
            background: activeTab === 'theory' ? 'var(--primary-soft)' : 'var(--neutral-surface)',
            color: activeTab === 'theory' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          3. OS Viva Guide: Avoidance vs. Detection
        </button>
      </div>

      {/* ========================================================
          TAB 1: BANKER'S ALGORITHM (DEADLOCK AVOIDANCE)
          ======================================================== */}
      {activeTab === 'bankers' && (
        <>
          {/* Action Toolbar */}
          <div className="actions-toolbar" style={{ marginBottom: '1.5rem' }}>
            <div className="toolbar-info">
              <h3>Banker's Algorithm: Resource State Matrices</h3>
              <p>
                Formula: <code>Need[i] = Maximum[i] − Allocation[i]</code>. Editable values for 5 agricultural tasks.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-retry" onClick={handleLoadSafeBankers}>
                Load Safe Example
              </button>
              <button
                type="button"
                className="btn-retry"
                style={{ backgroundColor: '#d97706' }}
                onClick={handleLoadUnsafeBankers}
              >
                Load Unsafe Example
              </button>
              <button type="button" className="btn-generate" onClick={handleCalculateBankers}>
                Calculate Safety
              </button>
              <button
                type="button"
                onClick={handleResetBankers}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--neutral-border)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Validation Error Alert */}
          {bError && (
            <div className="feedback-alert error" style={{ marginBottom: '1.25rem' }}>
              <strong>Validation Error:</strong> {bError}
            </div>
          )}

          {/* Available Resources Vector */}
          <div className="status-card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Available Resources Vector (Currently Free in Farm System)
            </h4>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {DEFAULT_RESOURCES.map((r, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {r.name}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bAvailable[j]}
                    onChange={(e) => updateVectorCell(bAvailable, setBAvailable, j, e.target.value)}
                    style={{
                      width: '65px',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neutral-border)',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Matrices Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Allocation Matrix */}
            <div className="data-table-card">
              <div className="data-table-header">
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Allocation Matrix</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently held resources</span>
                </div>
              </div>
              <div className="data-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>R0 (Water)</th>
                      <th>R1 (Chem)</th>
                      <th>R2 (Power)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_PROCESSES.map((p, i) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        {[0, 1, 2].map((j) => (
                          <td key={j}>
                            <input
                              type="number"
                              min="0"
                              value={bAllocation[i][j]}
                              onChange={(e) => updateMatrixCell(bAllocation, setBAllocation, i, j, e.target.value)}
                              style={{
                                width: '55px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--neutral-border)',
                                textAlign: 'center',
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Maximum Matrix */}
            <div className="data-table-card">
              <div className="data-table-header">
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Maximum Claim Matrix</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max declared demand</span>
                </div>
              </div>
              <div className="data-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>R0 (Water)</th>
                      <th>R1 (Chem)</th>
                      <th>R2 (Power)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_PROCESSES.map((p, i) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        {[0, 1, 2].map((j) => (
                          <td key={j}>
                            <input
                              type="number"
                              min="0"
                              value={bMax[i][j]}
                              onChange={(e) => updateMatrixCell(bMax, setBMax, i, j, e.target.value)}
                              style={{
                                width: '55px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--neutral-border)',
                                textAlign: 'center',
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculated Need Matrix */}
            <div className="data-table-card">
              <div className="data-table-header">
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    Calculated Need Matrix
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Need = Max − Allocation</span>
                </div>
                <span className="sidebar-footer-badge">Auto Computed</span>
              </div>
              <div className="data-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>R0 (Water)</th>
                      <th>R1 (Chem)</th>
                      <th>R2 (Power)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_PROCESSES.map((p, i) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        {[0, 1, 2].map((j) => {
                          const val = needMatrix[i][j];
                          const isInvalid = val < 0;
                          return (
                            <td key={j} style={{ fontWeight: 600, color: isInvalid ? '#dc2626' : 'var(--text-primary)' }}>
                              {val} {isInvalid && '(!)'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Banker's Safety Results */}
          {bResult && (
            <div className="status-card" style={{ marginBottom: '1.5rem', borderLeft: `5px solid ${bResult.isSafe ? '#2e7d32' : '#d97706'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: bResult.isSafe ? 'var(--primary-dark)' : '#b45309' }}>
                  Safety Check Result: {bResult.isSafe ? 'SAFE STATE' : 'UNSAFE STATE'}
                </h3>
                <span
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    backgroundColor: bResult.isSafe ? '#e8f5e9' : '#fef3c7',
                    color: bResult.isSafe ? '#2e7d32' : '#b45309',
                    border: `1px solid ${bResult.isSafe ? '#a3d9a5' : '#fde68a'}`,
                  }}
                >
                  {bResult.isSafe ? 'DEADLOCK AVOIDED' : 'CAUTION: UNSAFE'}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                {bResult.message}
              </p>

              {bResult.isSafe ? (
                <div style={{ background: '#f0fdf4', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Verified Safe Execution Sequence:
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.35rem' }}>
                    {bResult.safeSequence.map((pid, idx) => (
                      <span key={idx}>
                        <span style={{ background: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--primary-border)' }}>
                          {pid}
                        </span>
                        {idx < bResult.safeSequence.length - 1 && '  ➜  '}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Crucial Operating Systems Concept (Viva Tip):
                  </span>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    An <strong>UNSAFE</strong> state is <em>not necessarily deadlocked</em>. It simply means the OS cannot
                    guarantee avoiding deadlock if all active agricultural tasks suddenly request their full maximum claims.
                    Deadlock is only possible, not guaranteed.
                  </p>
                </div>
              )}

              {/* Step-by-Step Execution Trace */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>
                Step-by-Step Work Vector & Safety Trace
              </h4>
              <div className="data-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Step</th>
                      <th>Process</th>
                      <th>Need Vector</th>
                      <th>Work Before</th>
                      <th>Allocation Added</th>
                      <th>Work After</th>
                      <th>OS Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bResult.steps.map((st) => (
                      <tr key={st.step}>
                        <td><strong>#{st.step}</strong></td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{st.processId}</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.processName}</div>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>[{st.need.join(', ')}]</td>
                        <td style={{ fontFamily: 'monospace' }}>[{st.workBefore.join(', ')}]</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>+[{st.allocation.join(', ')}]</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>[{st.workAfter.join(', ')}]</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{st.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          TAB 2: DEADLOCK DETECTION (MULTIPLE RESOURCES)
          ======================================================== */}
      {activeTab === 'detection' && (
        <>
          <div className="actions-toolbar" style={{ marginBottom: '1.5rem' }}>
            <div className="toolbar-info">
              <h3>Deadlock Detection: Allocation & Request Matrices</h3>
              <p>
                Unlike Banker's Algorithm, detection uses <strong>actual current Requests</strong> instead of maximum claims.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-retry" onClick={handleLoadSafeDetection}>
                Load No-Deadlock Scenario
              </button>
              <button
                type="button"
                className="btn-retry"
                style={{ backgroundColor: '#dc2626' }}
                onClick={handleLoadDeadlockedDetection}
              >
                Load Deadlock Contention Scenario
              </button>
              <button type="button" className="btn-generate" onClick={handleCalculateDetection}>
                Run Detection Algorithm
              </button>
            </div>
          </div>

          {dError && (
            <div className="feedback-alert error" style={{ marginBottom: '1.25rem' }}>
              <strong>Validation Error:</strong> {dError}
            </div>
          )}

          {/* Available Vector for Detection */}
          <div className="status-card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Available Resources Vector
            </h4>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {DEFAULT_RESOURCES.map((r, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {r.name}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dAvailable[j]}
                    onChange={(e) => updateVectorCell(dAvailable, setDAvailable, j, e.target.value)}
                    style={{
                      width: '65px',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neutral-border)',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Matrices Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Allocation Matrix */}
            <div className="data-table-card">
              <div className="data-table-header">
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Allocation Matrix</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently assigned resource units</span>
                </div>
              </div>
              <div className="data-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>R0 (Water)</th>
                      <th>R1 (Chem)</th>
                      <th>R2 (Power)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_PROCESSES.map((p, i) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        {[0, 1, 2].map((j) => (
                          <td key={j}>
                            <input
                              type="number"
                              min="0"
                              value={dAllocation[i][j]}
                              onChange={(e) => updateMatrixCell(dAllocation, setDAllocation, i, j, e.target.value)}
                              style={{
                                width: '55px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--neutral-border)',
                                textAlign: 'center',
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Request Matrix */}
            <div className="data-table-card">
              <div className="data-table-header">
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626' }}>Request Matrix</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outstanding requests pending fulfillment</span>
                </div>
              </div>
              <div className="data-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>R0 (Water)</th>
                      <th>R1 (Chem)</th>
                      <th>R2 (Power)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_PROCESSES.map((p, i) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        {[0, 1, 2].map((j) => (
                          <td key={j}>
                            <input
                              type="number"
                              min="0"
                              value={dRequest[i][j]}
                              onChange={(e) => updateMatrixCell(dRequest, setDRequest, i, j, e.target.value)}
                              style={{
                                width: '55px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--neutral-border)',
                                textAlign: 'center',
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detection Results */}
          {dResult && (
            <div className="status-card" style={{ marginBottom: '1.5rem', borderLeft: `5px solid ${dResult.isDeadlocked ? '#dc2626' : '#2e7d32'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: dResult.isDeadlocked ? '#dc2626' : 'var(--primary-dark)' }}>
                  Detection Result: {dResult.isDeadlocked ? 'DEADLOCK DETECTED' : 'SYSTEM HEALTHY (NO DEADLOCK)'}
                </h3>
                <span
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    backgroundColor: dResult.isDeadlocked ? '#fee2e2' : '#e8f5e9',
                    color: dResult.isDeadlocked ? '#dc2626' : '#2e7d32',
                    border: `1px solid ${dResult.isDeadlocked ? '#fca5a5' : '#a3d9a5'}`,
                  }}
                >
                  {dResult.isDeadlocked ? 'CIRCULAR WAIT PRESENT' : 'DEADLOCK FREE'}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                {dResult.message}
              </p>

              {dResult.isDeadlocked ? (
                <div style={{ background: '#fef2f2', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Deadlocked Processes:
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
                    {dResult.deadlockedProcesses.map((pid, idx) => (
                      <span key={idx} style={{ background: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #fca5a5', marginRight: '0.5rem' }}>
                        {pid}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7f1d1d', marginTop: '0.5rem' }}>
                    These processes are waiting for resources held by each other. The OS must either abort one of them or
                    preempt resources to break the circular dependency.
                  </p>
                </div>
              ) : (
                <div style={{ background: '#f0fdf4', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Execution Sequence of Unblocked Processes:
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '0.35rem' }}>
                    {dResult.completedProcesses.join('  ➜  ')}
                  </div>
                </div>
              )}

              {/* Step Trace */}
              {dResult.steps.length > 0 && (
                <>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>
                    Detection Algorithm Step Trace
                  </h4>
                  <div className="data-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>Step</th>
                          <th>Process</th>
                          <th>Request Vector</th>
                          <th>Work Before</th>
                          <th>Allocation Recovered</th>
                          <th>Work After</th>
                          <th>Explanation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dResult.steps.map((st) => (
                          <tr key={st.step}>
                            <td><strong>#{st.step}</strong></td>
                            <td><strong style={{ color: 'var(--primary-dark)' }}>{st.processId}</strong></td>
                            <td style={{ fontFamily: 'monospace' }}>[{st.request.join(', ')}]</td>
                            <td style={{ fontFamily: 'monospace' }}>[{st.workBefore.join(', ')}]</td>
                            <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>+[{st.allocation.join(', ')}]</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>[{st.workAfter.join(', ')}]</td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{st.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          TAB 3: OS VIVA GUIDE: AVOIDANCE VS. DETECTION
          ======================================================== */}
      {activeTab === 'theory' && (
        <div className="status-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            Deadlock Avoidance vs. Deadlock Detection: Comparison Guide
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Understanding the distinction between Deadlock Avoidance and Deadlock Detection is a core question in
            Operating Systems examinations and viva evaluations.
          </p>

          <div className="data-table-container" style={{ marginBottom: '2rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Comparison Factor</th>
                  <th style={{ width: '39%' }}>Deadlock Avoidance (Banker's Algorithm)</th>
                  <th style={{ width: '39%' }}>Deadlock Detection</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Core Philosophy</strong></td>
                  <td>Proactive: Never allow the system to enter an unsafe state.</td>
                  <td>Reactive: Allow processes to request freely; detect if deadlocks arise.</td>
                </tr>
                <tr>
                  <td><strong>Prerequisite Knowledge</strong></td>
                  <td>
                    Requires <strong>a priori knowledge</strong> of the <em>maximum</em> resource demands each task will ever claim.
                  </td>
                  <td>
                    Only requires current <em>actual requests</em>; no advance knowledge of maximums needed.
                  </td>
                </tr>
                <tr>
                  <td><strong>When It Runs</strong></td>
                  <td>Dynamically on <strong>every single resource request</strong> prior to granting.</td>
                  <td>Periodically (e.g., every few seconds or when CPU utilization drops).</td>
                </tr>
                <tr>
                  <td><strong>System State Concept</strong></td>
                  <td>
                    Classifies states into <strong>Safe</strong> and <strong>Unsafe</strong>.
                    <br />
                    <em>Note: Unsafe does not mean already deadlocked!</em>
                  </td>
                  <td>
                    Directly classifies whether a <strong>Circular Wait</strong> currently exists among active processes.
                  </td>
                </tr>
                <tr>
                  <td><strong>Recovery Mechanism</strong></td>
                  <td>No recovery needed because deadlocks are prevented before they occur.</td>
                  <td>Requires manual or automatic process termination or resource preemption.</td>
                </tr>
                <tr>
                  <td><strong>Agricultural Scenario</strong></td>
                  <td>
                    Before turning on Zone A sprinkler, check if enough water & power remain to satisfy emergency frost protection if needed.
                  </td>
                  <td>
                    Detect when Pump A and Pump B are both stalled waiting on chemical valves held by one another.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
              💡 Quick Viva Answer Summary:
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <em>"Banker's Algorithm avoids deadlocks by ensuring that every resource allocation keeps the system in a
              Safe State, where at least one sequence of processes can run to completion. Deadlock Detection, on the other hand,
              allows processes to lock resources optimistically, and periodically checks if any set of processes is permanently blocked
              in a circular wait."</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
